import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// Depending on how you configure Appwrite, you typically use req.variables to get env vars.
// The Appwrite context exposes `req` and `res`, and `log`, `error`.

export default async ({ req, res, log, error }) => {
  try {
    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY || req.variables?.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      error("GEMINI_API_KEY not configured.");
      return res.json(
        { success: false, error: "AI not configured on server." },
        500,
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Ensure we have a JSON payload
    let payload = req.bodyRaw ? JSON.parse(req.bodyRaw) : req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (_e) {}
    }

    const action = payload.action;
    const data = payload.data;

    if (!action) {
      return res.json({ success: false, error: "No action provided" }, 400);
    }

    let resultText = "";

    log(`Action: ${action}`);

    // Route actions
    switch (action) {
      case "chat": {
        const { message, context } = data;
        let contextStr = `You are an HR Assistant. Answer questions helpfully and professionally.`;

        if (context?.user) {
          contextStr += `\n\nCurrent User:\n- Name: ${context.user.name}\n- Position: ${context.user.position}\n- Department: ${context.user.department}\n- Email: ${context.user.email}`;
        }

        if (context?.leaves?.length > 0) {
          const approved = context.leaves.filter(
            (l) => l.status === "approved",
          );
          const used = approved.reduce((sum, l) => sum + l.numberOfDays, 0);
          contextStr += `\n\nLeave Information:\n- Total Annual Leaves: 20 days\n- Used: ${used} days\n- Remaining: ${20 - used} days\n- Recent Leave Requests: ${approved.map((l) => `${l.leaveType} (${l.startDate})`).join(", ") || "None"}`;
        }

        if (context?.payslips?.length > 0) {
          const latest = context.payslips[0];
          contextStr += `\n\nSalary Information:\n- Gross Salary: ₹${latest.calculation.grossSalary}\n- Deductions: ₹${latest.calculation.deductions}\n- Net Salary: ₹${latest.calculation.netSalary}\n- Breakdown: ${JSON.stringify(latest.calculation.breakdown)}`;
        }

        if (context?.attendanceStats) {
          contextStr += `\n\nAttendance (This Month):\n- Present: ${context.attendanceStats.present} days\n- Absent: ${context.attendanceStats.absent} days\n- Half Days: ${context.attendanceStats.halfDay}\n- On Leave: ${context.attendanceStats.onLeave}`;
        }

        const prompt = `${contextStr}\n\nUser Question: ${message}\n\nProvide a helpful and accurate answer based on the context provided.`;

        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }

      case "getInsights": {
        const { employees, leaves, attendance } = data;
        let analyticsContext =
          "Provide 3-4 key HR insights based on this data:\n";

        if (employees) {
          analyticsContext += `\n- Total Employees: ${employees.length}`;
          const byDept = employees.reduce((acc, e) => {
            acc[e.department] = (acc[e.department] || 0) + 1;
            return acc;
          }, {});
          analyticsContext += `\n- Employees by Department: ${JSON.stringify(byDept)}`;
        }

        if (leaves?.length > 0) {
          const pending = leaves.filter((l) => l.status === "pending").length;
          const approved = leaves.filter((l) => l.status === "approved").length;
          analyticsContext += `\n- Leave Requests: ${pending} pending, ${approved} approved`;
        }

        if (attendance) {
          const avgAttendance = Math.round(
            (attendance.filter((a) => a.status === "present").length /
              attendance.length) *
              100,
          );
          analyticsContext += `\n- Average Attendance Rate: ${avgAttendance}%`;
        }

        const result = await model.generateContent(analyticsContext);
        resultText = result.response.text();
        break;
      }

      case "explainSalary": {
        const { payslip, salary, jobTitle } = data;
        if (payslip) {
          const prompt = `Provide a clear explanation of this payslip breakdown in a friendly tone:
Gross Salary: ₹${payslip.calculation.grossSalary}
Earnings: ${JSON.stringify(payslip.calculation.breakdown)}
Deductions: ₹${payslip.calculation.deductions}
Net Salary: ₹${payslip.calculation.netSalary}
Explain each component and what it means.`;
          const result = await model.generateContent(prompt);
          resultText = result.response.text();
        } else if (salary && jobTitle) {
          const prompt = `Explain this salary in simple, human terms for a ${jobTitle} earning $${salary} annually. Include what this salary might cover (rent, bills, etc.) in a major US city. Keep it to 2-3 sentences.`;
          const result = await model.generateContent(prompt);
          resultText = result.response.text();
        } else {
          resultText = "No salary info provided.";
        }
        break;
      }

      case "getAttendanceInsights": {
        const { stats } = data;
        const totalDays =
          stats.present + stats.absent + stats.halfDay + stats.onLeave;
        const attendanceRate = totalDays
          ? Math.round((stats.present / totalDays) * 100)
          : 0;
        const prompt = `Analyze this attendance data and provide insights:
- Present: ${stats.present} days (${attendanceRate}%)
- Absent: ${stats.absent} days
- Half Days: ${stats.halfDay}
- On Leave: ${stats.onLeave}`;
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }

      case "generateAIInsights": {
        const d = data;
        const prompt = `As an HR analytics expert, provide 2-3 key insights about this workforce data in a friendly, actionable way:
- Total Employees: ${d.totalEmployees}
- Active Today: ${d.activeEmployees}
- Attendance Rate: ${d.attendanceRate}%
- Average Salary: $${d.avgSalary}
- On Leave: ${d.onLeaveCount}
- Pending Leave Requests: ${d.pendingLeavesCount}
Keep response concise (2-3 sentences max).`;
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }

      case "getSmartRecommendations": {
        const d = data;
        const issues = [];
        if (d.lowAttendanceEmployees)
          issues.push(
            `${d.lowAttendanceEmployees} employees with low attendance`,
          );
        if (d.highTurnoverRate)
          issues.push(`${d.highTurnoverRate}% turnover rate`);
        if (d.pendingLeavesCount)
          issues.push(`${d.pendingLeavesCount} pending leave requests`);
        if (d.unprocessedPayroll)
          issues.push(`${d.unprocessedPayroll} unprocessed payrolls`);

        if (issues.length === 0) {
          resultText = JSON.stringify([
            "No critical issues detected.",
            "Keep monitoring HR metrics.",
            "Review employee engagement scores.",
          ]);
          break;
        }
        const prompt = `As an HR consultant, provide 3 specific, actionable recommendations to address these workplace issues: ${issues.join(", ")}. Format as a numbered list (1. 2. 3.).`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const list = text
          .split("\n")
          .filter((line) => line.trim().match(/^\d+\./));
        resultText = JSON.stringify(
          list.length
            ? list
            : [
                "Review attendance policies",
                "Conduct employee surveys",
                "Streamline payroll processes",
              ],
        );
        break;
      }

      case "chatWithAI": {
        const { message, conversationHistory } = data;
        const history = (conversationHistory || [])
          .filter(
            (msg) =>
              msg.role === "user" ||
              msg.role === "model" ||
              msg.role === "assistant",
          )
          .map((msg) => ({
            role: msg.role === "assistant" ? "model" : msg.role,
            parts: [{ text: msg.content }],
          }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        resultText = result.response.text();
        break;
      }

      case "analyzePayrollTrends": {
        const { payrollData } = data;
        const dataStr = payrollData
          .map((p) => `${p.month}: $${p.amount}`)
          .join(", ");
        const prompt = `Analyze this payroll trend data and provide brief insights: ${dataStr}. Mention any patterns, spikes, or concerns.`;
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }

      default:
        return res.json({ success: false, error: "Unknown action" }, 400);
    }

    return res.json({ success: true, response: resultText });
  } catch (err) {
    error(`Failed to execute AI function: ${err.message}`);
    return res.json(
      { success: false, error: "Failed to process AI request" },
      500,
    );
  }
};
