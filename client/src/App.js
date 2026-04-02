// App.js — HomeFunds

import React, { useState, useEffect } from "react";
import "./App.css";

const PAGES = {
  CONNECT: "CONNECT",
  DASHBOARD: "DASHBOARD",
  BUDGET: "BUDGET",
  FAMILY: "FAMILY",
  GOALS: "GOALS",
  SETTINGS: "SETTINGS",
};

function App() {

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("SIGNUP"); // "LOGIN" or "SIGNUP"


  const [incomeSources, setIncomeSources] = useState([
    { id: 1, name: "Main Paycheck", amount: 3500 },
  ]);

  const [bills, setBills] = useState([
    {
      id: 1,
      name: "Rent",
      amount: 1200,
      dueDate: "2025-12-01",
      category: "Needs",
    },
    {
      id: 2,
      name: "Electric",
      amount: 120,
      dueDate: "2025-12-12",
      category: "Needs",
    },
  ]);

  const [familyMembers, setFamilyMembers] = useState(["Parent", "Child"]);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      member: "Parent",
      description: "Groceries",
      amount: 110,
      category: "Needs",
    },
    {
      id: 2,
      member: "Child",
      description: "School Supplies",
      amount: 30,
      category: "Needs",
    },
  ]);

  const [goal, setGoal] = useState({
    name: "Emergency Fund",
    targetAmount: 1000,
    currentAmount: 200,
    deadline: "2026-03-01",
  });

  const [connectedBank, setConnectedBank] = useState(null);
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [budgetMode, setBudgetMode] = useState("CUSTOM");
  const [customNeedsPct, setCustomNeedsPct] = useState(70);
  const [customSavingsPct, setCustomSavingsPct] = useState(20);
  const [customWantsPct, setCustomWantsPct] = useState(10);
  const [monthlyLimit, setMonthlyLimit] = useState("");


  const totalIncome = incomeSources.reduce(
    (sum, src) => sum + Number(src.amount || 0),
    0
  );
  const totalBills = bills.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  const remainingAfterBills = totalIncome - totalBills;

  let projectedMonthlySavings = 0;
  if (budgetMode === "PRESET_70_20_10") {
    projectedMonthlySavings = totalIncome * 0.2;
  } else {
    projectedMonthlySavings = totalIncome * (customSavingsPct / 100);
  }

  const goalProgress = goal.targetAmount
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const overspending =
    totalExpenses + totalBills > totalIncome && totalIncome > 0;

  const totalPlannedSpending = totalBills + totalExpenses;
  const overLimit =
    monthlyLimit !== "" &&
    totalPlannedSpending > Number(monthlyLimit || 0);



  const handleSignup = (formData) => {
    const {
      fullName,
      email,
      password,
      accountType,
      goalName,
      goalTarget,
      monthlyIncome,
      paySchedule,
      linkBankNow,
    } = formData;

    if (!fullName || !email || !password) {
      alert("Please fill in name, email, and password.");
      return;
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      alert("An account with that email already exists. Please log in.");
      setAuthMode("LOGIN");
      return;
    }

    const parsedGoalTarget = Number(goalTarget) || 0;
    const parsedMonthlyIncome = Number(monthlyIncome) || 0;

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      accountType,
      primaryGoalName: goalName,
      primaryGoalTarget: parsedGoalTarget,
      monthlyIncome: parsedMonthlyIncome,
      paySchedule,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // use signup info to set the main goal
    setGoal({
      name: goalName || "Emergency Fund",
      targetAmount: parsedGoalTarget || 1000,
      currentAmount: 0,
      deadline: "",
    });

    // use income from signup as starting income source if provided
    if (parsedMonthlyIncome > 0) {
      setIncomeSources([
        {
          id: 1,
          name:
            accountType === "NEW_GRAD"
              ? "Grad Paycheck"
              : "Household Paycheck",
          amount: parsedMonthlyIncome,
        },
      ]);
    }

    // After signup: if they want to link a bank now,
    // send them to Connect Bank once, then to Dashboard
    if (linkBankNow) {
      setCurrentPage(PAGES.CONNECT);
    } else {
      setCurrentPage(PAGES.DASHBOARD);
    }
  };

  const handleLogin = (email, password) => {
    const match = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!match) {
      alert("Invalid email or password, or user not signed up yet.");
      return;
    }

    setCurrentUser(match);
    setCurrentPage(PAGES.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode("LOGIN");
    setConnectedBank(null);
    setCurrentPage(PAGES.DASHBOARD);
  };

  // --- Remove handlers added so users can delete added items --- //
  const handleRemoveIncome = (id) => {
    if (!window.confirm("Remove this income source?")) return;
    setIncomeSources((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemoveBill = (id) => {
    if (!window.confirm("Remove this bill?")) return;
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleRemoveExpense = (id) => {
    if (!window.confirm("Remove this expense?")) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRemoveMember = (name) => {
    if (!window.confirm(`Remove member "${name}" and their recorded expenses?`))
      return;
    setFamilyMembers((prev) => prev.filter((m) => m !== name));
    // Also remove expenses associated with that member
    setExpenses((prev) => prev.filter((e) => e.member !== name));
  };

  const handleAddIncome = (name, amount) => {
    if (!name || !amount) return;
    setIncomeSources((prev) => [
      ...prev,
      { id: Date.now(), name, amount: Number(amount) },
    ]);
  };

  const handleAddBill = (name, amount, dueDate, category) => {
    if (!name || !amount) return;
    setBills((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        amount: Number(amount),
        dueDate: dueDate || "",
        category: category || "Needs",
      },
    ]);
  };

  const handleAddExpense = (member, description, amount, category) => {
    if (!member || !description || !amount) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        member,
        description,
        amount: Number(amount),
        category: category || "Wants",
      },
    ]);
  };

  const handleUpdateGoal = (updates) => {
    setGoal((prev) => ({ ...prev, ...updates }));
  };

  const handleAddMember = (name) => {
    if (!name) return;
    if (!familyMembers.includes(name)) {
      setFamilyMembers((prev) => [...prev, name]);
    }
  };


  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <AuthCard
          authMode={authMode}
          setAuthMode={setAuthMode}
          onSignup={handleSignup}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  // --- Main app ---

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main">
        <Header
          connectedBank={connectedBank}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {currentPage === PAGES.CONNECT && (
          <ConnectBank
            setConnectedBank={setConnectedBank}
            onConnected={() => setCurrentPage(PAGES.DASHBOARD)}
          />
        )}

        {currentPage === PAGES.DASHBOARD && (
          <Dashboard
            totalIncome={totalIncome}
            totalBills={totalBills}
            totalExpenses={totalExpenses}
            remainingAfterBills={remainingAfterBills}
            projectedMonthlySavings={projectedMonthlySavings}
            goal={goal}
            goalProgress={goalProgress}
            overspending={overspending}
            monthlyLimit={monthlyLimit}
            setMonthlyLimit={setMonthlyLimit}
            overLimit={overLimit}
            bills={bills}
            budgetMode={budgetMode}
            customNeedsPct={customNeedsPct}
            customSavingsPct={customSavingsPct}
            customWantsPct={customWantsPct}
          />
        )}

        {currentPage === PAGES.BUDGET && (
          <BudgetPlanner
            incomeSources={incomeSources}
            bills={bills}
            onAddIncome={handleAddIncome}
            onAddBill={handleAddBill}
            onRemoveIncome={handleRemoveIncome}
            onRemoveBill={handleRemoveBill}
            budgetMode={budgetMode}
            setBudgetMode={setBudgetMode}
            totalIncome={totalIncome}
            customNeedsPct={customNeedsPct}
            customSavingsPct={customSavingsPct}
            customWantsPct={customWantsPct}
            setCustomNeedsPct={setCustomNeedsPct}
            setCustomSavingsPct={setCustomSavingsPct}
            setCustomWantsPct={setCustomWantsPct}
          />
        )}

        {currentPage === PAGES.FAMILY && (
          <FamilySpending
            familyMembers={familyMembers}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onRemoveExpense={handleRemoveExpense}
          />
        )}

        {currentPage === PAGES.GOALS && (
          <GoalsAndRecommendations
            goal={goal}
            goalProgress={goalProgress}
            projectedMonthlySavings={projectedMonthlySavings}
            setGoal={handleUpdateGoal}
            currentUser={currentUser}
          />
        )}

        {currentPage === PAGES.SETTINGS && (
          <Settings
            familyMembers={familyMembers}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </main>
    </div>
  );
}

/* ---------- Auth Components ---------- */

function AuthCard({ authMode, setAuthMode, onSignup, onLogin }) {
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState("FAMILY");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [paySchedule, setPaySchedule] = useState("MONTHLY");
  const [linkBankNow, setLinkBankNow] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmitSignup = (e) => {
    e.preventDefault();
    onSignup({
      fullName,
      email,
      password,
      accountType,
      goalName,
      goalTarget,
      monthlyIncome,
      paySchedule,
      linkBankNow,
    });
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-card">
      <h1 className="logo auth-logo">HomeFunds</h1>

      <div className="auth-toggle">
        <button
          className={authMode === "LOGIN" ? "auth-tab active" : "auth-tab"}
          onClick={() => setAuthMode("LOGIN")}
        >
          Log In
        </button>
        <button
          className={authMode === "SIGNUP" ? "auth-tab active" : "auth-tab"}
          onClick={() => setAuthMode("SIGNUP")}
        >
          Sign Up
        </button>
      </div>

      {authMode === "LOGIN" ? (
        <form className="auth-form" onSubmit={handleSubmitLogin}>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Log in to view your budget, goals, and family spending.
          </p>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="auth-submit">
            Log In
          </button>

          <p className="auth-footnote">
            First time here?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setAuthMode("SIGNUP")}
            >
              Create an account
            </button>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleSubmitSignup}>
          <h2>Create your HomeFunds account</h2>
          <p className="auth-subtitle">
            Tell us a bit about you so we can set up your dashboard and first
            savings goal.
          </p>

          <label>
            Full Name
            <input
              type="text"
              placeholder="Jordan Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Account Type
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="FAMILY">Family household</option>
              <option value="NEW_GRAD">New grad / single income</option>
            </select>
          </label>

          <label>
            Savings Goal Name
            <input
              type="text"
              placeholder="e.g., Emergency Fund"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </label>

          <div className="auth-grid-2">
            <label>
              Target Amount ($)
              <input
                type="number"
                placeholder="e.g., 1000"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
            </label>

            <label>
              Estimated Monthly Income
              <input
                type="number"
                placeholder="e.g., 3500"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </label>
          </div>

          <label>
            Pay Schedule
            <select
              value={paySchedule}
              onChange={(e) => setPaySchedule(e.target.value)}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="BIWEEKLY">Every 2 weeks</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={linkBankNow}
              onChange={(e) => setLinkBankNow(e.target.checked)}
            />
            I want to link a bank account after sign up.
          </label>

          <button type="submit" className="auth-submit">
            Create Account
          </button>

          <p className="auth-footnote">
            Already have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setAuthMode("LOGIN")}
            >
              Log in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

/* ---------- Layout components ---------- */

function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <nav className="sidebar">
      <h1 className="logo">HomeFunds</h1>

      {/* Dashboard first, as the main page */}
      <button
        className={currentPage === PAGES.DASHBOARD ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.DASHBOARD)}
      >
        Dashboard
      </button>

      <button
        className={currentPage === PAGES.BUDGET ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.BUDGET)}
      >
        Budget Planner
      </button>

      <button
        className={currentPage === PAGES.FAMILY ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.FAMILY)}
      >
        Family Spending
      </button>

      <button
        className={currentPage === PAGES.GOALS ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.GOALS)}
      >
        Goals & Tips
      </button>

      {/* Connect Bank moved lower in the nav */}
      <button
        className={currentPage === PAGES.CONNECT ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.CONNECT)}
      >
        Connect Bank
      </button>

      <button
        className={currentPage === PAGES.SETTINGS ? "active" : ""}
        onClick={() => setCurrentPage(PAGES.SETTINGS)}
      >
        Settings
      </button>
    </nav>
  );
}

function Header({ connectedBank, currentUser, onLogout }) {
  return (
    <header className="header">
      <div>
        <h2>Family Budget & Savings Companion</h2>
        <p>Simple budgeting for families on a single paycheck.</p>
      </div>
      <div className="header-status">
        <div className="header-user">
          <span className="header-name">
            {currentUser?.fullName || "User"}
          </span>
          <span className="header-email">{currentUser?.email}</span>
        </div>
        <span className="header-bank">
          Bank:{" "}
          <strong>
            {connectedBank ? `Linked (${connectedBank})` : "Not linked"}
          </strong>
        </span>
        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}

/* ---------- Screens ---------- */

function ConnectBank({ setConnectedBank, onConnected }) {
  const [selected, setSelected] = useState("");

  const handleConnect = () => {
    if (!selected) return;
    setConnectedBank(selected);
    alert(`Bank ${selected} linked (simulated).`);
    if (onConnected) {
      onConnected();
    }
  };

  return (
    <section>
      <h3>Connect a Bank</h3>
      <p className="hint">
        Pick a bank to simulate linking your checking account. In the full app
        this would use a secure provider like Plaid.
      </p>
      <div className="card connect-card">
        <div className="connect-options">
          <label>
            <input
              type="radio"
              name="bank"
              value="Bank A"
              onChange={(e) => setSelected(e.target.value)}
            />
            Bank A (Big national bank)
          </label>
          <label>
            <input
              type="radio"
              name="bank"
              value="Bank B"
              onChange={(e) => setSelected(e.target.value)}
            />
            Bank B (Online-only bank)
          </label>
          <label>
            <input
              type="radio"
              name="bank"
              value="Bank C"
              onChange={(e) => setSelected(e.target.value)}
            />
            Bank C (Local credit union)
          </label>
        </div>
        <button onClick={handleConnect}>Link Selected Bank</button>
        <p className="hint">
          We don&apos;t connect to real accounts in this prototype. This step
          just tells the app to act as if your transactions are imported.
        </p>
      </div>
    </section>
  );
}

function Dashboard({
  totalIncome,
  totalBills,
  totalExpenses,
  remainingAfterBills,
  projectedMonthlySavings,
  goal,
  goalProgress,
  overspending,
  monthlyLimit,
  setMonthlyLimit,
  overLimit,
  bills,
  budgetMode,
  customNeedsPct,
  customSavingsPct,
  customWantsPct,
}) {
  const totalPlannedSpending = totalBills + totalExpenses;

  const today = new Date();
  const upcomingBills = (bills || [])
    .filter((b) => b.dueDate)
    .slice()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const daysUntil = (dueStr) => {
    if (!dueStr) return null;
    const due = new Date(dueStr);
    const diffMs = due - today;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <section>
      <h3>Dashboard</h3>
      <div className="grid-3">
        <div className="card">
          <h4>Monthly Overview</h4>
          <p>Income: ${totalIncome.toFixed(2)}</p>
          <p>Bills: ${totalBills.toFixed(2)}</p>
          <p>Other Spending: ${totalExpenses.toFixed(2)}</p>
          <p>
            <strong>Left after bills:</strong>{" "}
            ${remainingAfterBills.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <h4>Automatic Savings Plan</h4>
          <p>
            Budget mode:{" "}
            <strong>
              {budgetMode === "PRESET_70_20_10"
                ? "70 / 20 / 10 rule"
                : "Custom split"}
            </strong>
          </p>
          <p>
            Suggested monthly savings:{" "}
            <strong>${projectedMonthlySavings.toFixed(2)}</strong>
          </p>
          {budgetMode === "PRESET_70_20_10" ? (
            <p className="hint">
              Using 70/20/10: 70% Needs, 20% Savings, 10% Wants based on your
              income.
            </p>
          ) : (
            <p className="hint">
              Custom split: {customNeedsPct}% Needs, {customSavingsPct}% Savings,{" "}
              {customWantsPct}% Wants. Savings is calculated as{" "}
              {customSavingsPct}% of your income.
            </p>
          )}
        </div>

        <div className="card">
          <h4>Current Goal</h4>
          <p>{goal.name}</p>
          <p>
            ${goal.currentAmount.toFixed(2)} / $
            {goal.targetAmount.toFixed(2)}
          </p>
          <ProgressBar percent={goalProgress} />
          <p>Deadline: {goal.deadline || "Not set"}</p>
        </div>

        <div className="card">
          <h4>Monthly Spending Limit</h4>
          <p className="hint">
            Set a cap for this month&apos;s planned spending (bills + other
            expenses).
          </p>
          <label className="field-label">
            Limit amount ($)
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="e.g., 3000"
            />
          </label>
          <p>
            Planned spending:{" "}
            <strong>${totalPlannedSpending.toFixed(2)}</strong>
          </p>
          {overLimit && (
            <p className="warning">
              You are over your monthly spending limit.
            </p>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h4>Upcoming Bills</h4>
          {upcomingBills.length === 0 ? (
            <p className="hint">No bills with due dates have been added yet.</p>
          ) : (
            <ul className="upcoming-bills-list">
              {upcomingBills.map((bill) => {
                const days = daysUntil(bill.dueDate);
                let tagClass = "bill-tag";
                if (days !== null && days <= 3) {
                  tagClass += " due-urgent";
                } else if (days !== null && days <= 7) {
                  tagClass += " due-soon";
                }
                return (
                  <li key={bill.id} className="upcoming-bill-row">
                    <span>
                      {bill.name} – ${bill.amount.toFixed(2)}
                    </span>
                    <span>
                      <span className={tagClass}>
                        {bill.dueDate || "N/A"}
                        {days !== null && days >= 0
                          ? ` · ${days} day${days === 1 ? "" : "s"}`
                          : ""}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h4>Trade-Off Guidance</h4>
          {overspending ? (
            <>
              <p className="warning">
                You are on track to overspend this month.
              </p>
              <ul>
                <li>
                  Review “wants” (eating out, subscriptions) and cut one
                  category for this month.
                </li>
                <li>
                  Consider lowering your goal contribution slightly instead of
                  adding new debt.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="success">
                You are on track to hit your savings target this month.
              </p>
              <ul>
                <li>Try rounding up your goal by $25 for a stretch target.</li>
                <li>Lock in this budget as your “Recommended preset”.</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function BudgetPlanner({
  incomeSources,
  bills,
  onAddIncome,
  onAddBill,
  onRemoveIncome,
  onRemoveBill,
  budgetMode,
  setBudgetMode,
  totalIncome,
  customNeedsPct,
  customSavingsPct,
  customWantsPct,
  setCustomNeedsPct,
  setCustomSavingsPct,
  setCustomWantsPct,
}) {
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");

  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("");
  const [billCategory, setBillCategory] = useState("Needs");

  const presetSavings = totalIncome * 0.2;
  const presetNeeds = totalIncome * 0.7;
  const presetWants = totalIncome * 0.1;

  const handlePctChange = (setter) => (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      setter(0);
    } else {
      setter(value);
    }
  };

  return (
    <section>
      <h3>Budget Planner</h3>

      <div className="card">
        <h4>Budget mode</h4>
        <p className="hint">
          Choose how you want the app to calculate your recommended savings and
          split your income.
        </p>
        <div className="budget-mode-options">
          <label>
            <input
              type="radio"
              name="budget-mode"
              value="CUSTOM"
              checked={budgetMode === "CUSTOM"}
              onChange={(e) => setBudgetMode(e.target.value)}
            />
            Custom – define your own % for Needs / Savings / Wants
          </label>
          <label>
            <input
              type="radio"
              name="budget-mode"
              value="PRESET_70_20_10"
              checked={budgetMode === "PRESET_70_20_10"}
              onChange={(e) => setBudgetMode(e.target.value)}
            />
            70 / 20 / 10 – 70% Needs, 20% Savings, 10% Wants
          </label>
        </div>

        {budgetMode === "CUSTOM" && (
          <>
            <div className="form-row">
              <label className="field-label">
                Needs (%)
                <input
                  type="number"
                  value={customNeedsPct}
                  onChange={handlePctChange(setCustomNeedsPct)}
                />
              </label>
              <label className="field-label">
                Savings (%)
                <input
                  type="number"
                  value={customSavingsPct}
                  onChange={handlePctChange(setCustomSavingsPct)}
                />
              </label>
              <label className="field-label">
                Wants (%)
                <input
                  type="number"
                  value={customWantsPct}
                  onChange={handlePctChange(setCustomWantsPct)}
                />
              </label>
            </div>
            <p className="hint">
              For a balanced plan, try to keep the total near 100%. Savings is
              calculated using your Savings %.
            </p>
          </>
        )}

        {budgetMode === "PRESET_70_20_10" && totalIncome > 0 && (
          <p className="hint">
            With your current income of ${totalIncome.toFixed(2)}, this preset
            suggests about ${presetNeeds.toFixed(2)} for needs, $
            {presetSavings.toFixed(2)} for savings, and $
            {presetWants.toFixed(2)} for wants each month.
          </p>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h4>Income Sources</h4>
          <ul>
            {incomeSources.map((src) => (
              <li key={src.id}>
                {src.name}: ${Number(src.amount).toFixed(2)}{" "}
                <button
                  className="small-button danger"
                  onClick={() => onRemoveIncome && onRemoveIncome(src.id)}
                  style={{ marginLeft: 8 }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="form-row">
            <input
              placeholder="Income name"
              value={incomeName}
              onChange={(e) => setIncomeName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Monthly amount"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
            />
            <button
              onClick={() => {
                onAddIncome(incomeName, incomeAmount);
                setIncomeName("");
                setIncomeAmount("");
              }}
            >
              Add Income
            </button>
          </div>
        </div>

        <div className="card">
          <h4>Bills</h4>
          <ul>
            {bills.map((bill) => (
              <li key={bill.id}>
                {bill.name}: ${bill.amount.toFixed(2)} (due{" "}
                {bill.dueDate || "N/A"}) — {bill.category}{" "}
                <button
                  className="small-button danger"
                  onClick={() => onRemoveBill && onRemoveBill(bill.id)}
                  style={{ marginLeft: 8 }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="form-column">
            <input
              placeholder="Bill name"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
            />
            <input
              type="date"
              value={billDueDate}
              onChange={(e) => setBillDueDate(e.target.value)}
            />
            <select
              value={billCategory}
              onChange={(e) => setBillCategory(e.target.value)}
            >
              <option value="Needs">Needs</option>
              <option value="Wants">Wants</option>
            </select>
            <button
              onClick={() => {
                onAddBill(billName, billAmount, billDueDate, billCategory);
                setBillName("");
                setBillAmount("");
                setBillDueDate("");
                setBillCategory("Needs");
              }}
            >
              Add Bill
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilySpending({ familyMembers, expenses, onAddExpense, onRemoveExpense }) {
  const [selectedMember, setSelectedMember] = useState(familyMembers[0] || "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Needs");

  // keep selectedMember in sync if familyMembers change / are removed
  useEffect(() => {
    if (!familyMembers.includes(selectedMember)) {
      setSelectedMember(familyMembers[0] || "");
    }
  }, [familyMembers, selectedMember]);

  const filtered = expenses.filter((e) =>
    selectedMember ? e.member === selectedMember : true
  );
  const totalForMember = filtered.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  return (
    <section>
      <h3>Family Spending</h3>

      <div className="card">
        <label className="field-label">
          Select family member
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            {familyMembers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <p>
          Monthly total for {selectedMember}:{" "}
          <strong>${totalForMember.toFixed(2)}</strong>
        </p>

        <ul>
          {filtered.map((exp) => (
            <li key={exp.id}>
              {exp.description}: ${exp.amount.toFixed(2)} ({exp.category}){" "}
              <button
                className="small-button danger"
                onClick={() => onRemoveExpense && onRemoveExpense(exp.id)}
                style={{ marginLeft: 8 }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <h4>Add Expense</h4>
        <div className="form-column">
          <label className="field-label">
            Description
            <input
              placeholder="e.g., Groceries, gas, school trip"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="field-label">
            Amount
            <input
              type="number"
              placeholder="e.g., 45"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="field-label">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Needs">Needs</option>
              <option value="Wants">Wants</option>
            </select>
          </label>
          <button
            onClick={() => {
              onAddExpense(selectedMember, description, amount, category);
              setDescription("");
              setAmount("");
              setCategory("Needs");
            }}
          >
            Add Expense
          </button>
        </div>
      </div>
    </section>
  );
}

function GoalsAndRecommendations({
  goal,
  goalProgress,
  projectedMonthlySavings,
  setGoal,
  currentUser,
}) {
  const [name, setName] = useState(goal.name);
  const [target, setTarget] = useState(goal.targetAmount);
  const [current, setCurrent] = useState(goal.currentAmount);
  const [deadline, setDeadline] = useState(goal.deadline);

  const monthsToGoal =
    projectedMonthlySavings > 0
      ? Math.ceil((target - current) / projectedMonthlySavings)
      : null;

  return (
    <section>
      <h3>Goals & Recommendations</h3>
      <p className="hint">
        This goal was created from your signup info. You can refine it here as
        your budget changes.
      </p>
      <div className="grid-2">
        <div className="card">
          <h4>Edit goal details</h4>
          {currentUser?.primaryGoalName && (
            <p className="hint">
              Signup goal:{" "}
              <strong>
                {currentUser.primaryGoalName}{" "}
                {currentUser.primaryGoalTarget
                  ? `($${currentUser.primaryGoalTarget})`
                  : ""}
              </strong>
            </p>
          )}
          <div className="form-column">
            <label className="field-label">
              Goal name
              <input
                placeholder="Goal name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="field-label">
              Target amount ($)
              <input
                type="number"
                placeholder="Total you want to save"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </label>

            <label className="field-label">
              Current saved ($)
              <input
                type="number"
                placeholder="How much you&apos;ve saved so far"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
              />
            </label>

            <label className="field-label">
              Target date
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>

            <button
              onClick={() =>
                setGoal({
                  name,
                  targetAmount: Number(target),
                  currentAmount: Number(current),
                  deadline,
                })
              }
            >
              Save Goal
            </button>
          </div>
        </div>

        <div className="card">
          <h4>Progress</h4>
          <p>{goal.name}</p>
          <p>
            ${goal.currentAmount.toFixed(2)} / $
            {goal.targetAmount.toFixed(2)}
          </p>
          <ProgressBar percent={goalProgress} />
          {monthsToGoal && monthsToGoal > 0 ? (
            <p>
              At your current savings rate, you&apos;ll hit this goal in about{" "}
              <strong>{monthsToGoal} month(s)</strong>.
            </p>
          ) : (
            <p className="hint">
              Increase your suggested savings on the Dashboard to see a time
              estimate.
            </p>
          )}

          <h4>Recommendations</h4>
          <ul>
            <li>
              Mark student loan payments as “Needs” bills to protect them in the
              budget (covers grad-student persona).
            </li>
            <li>
              Once this goal is complete, re-allocate the same savings amount to
              investments or credit-card payoff.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Settings({ familyMembers, onAddMember, onRemoveMember }) {
  const [newMember, setNewMember] = useState("");

  return (
    <section>
      <h3>Settings</h3>
      <div className="grid-2">
        <div className="card">
          <h4>Profile</h4>
          <p>Name: Demo Profile (from signup)</p>
          <p>Email is shown in the header.</p>
        </div>

        <div className="card">
          <h4>Family Members</h4>
          <ul>
            {familyMembers.map((m) => (
              <li key={m}>
                {m}{" "}
                <button
                  className="small-button danger"
                  onClick={() => onRemoveMember && onRemoveMember(m)}
                  style={{ marginLeft: 8 }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="form-row">
            <input
              placeholder="New member name"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            />
            <button
              onClick={() => {
                onAddMember(newMember);
                setNewMember("");
              }}
            >
              Add Member
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Shared UI ---------- */

function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default App;