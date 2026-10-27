
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://expense-tracker-api-ln4e.onrender.com";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyForm = () => ({
  title: "",
  amount: "",
  category: "Food",
  date: today(),
});

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadExpenses() {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load expenses.");
      }

      const data = await response.json();
      setExpenses(data);
      setMessage("");
    } catch (error) {
      setMessage(
        "Could not connect to the backend. Make sure your server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setMessage("Amount must be greater than zero.");
      return;
    }

    if (!form.date || form.date > today()) {
      setMessage("Please select a valid date that is not in the future.");
      return;
    }

    const expenseData = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    };

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save expense.");
      }

      setForm(emptyForm());
      setEditingId(null);
      setMessage(editingId ? "Expense updated!" : "Expense added!");
      await loadExpenses();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(expense) {
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
    });
    setEditingId(expense._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete expense.");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm());
      }

      setMessage("Expense deleted!");
      await loadExpenses();
    } catch (error) {
      setMessage(error.message || "Could not delete expense.");
    }
  }

  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">PERSONAL FINANCE</p>
        <h1>Expense Tracker</h1>
        <p>Track your spending, one expense at a time.</p>
      </header>

      <section className="summary">
        <p>Total expenses</p>
        <h2>
          {totalSpent.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </h2>
        <span>{expenses.length} expense(s) recorded</span>
      </section>

      <section className="panel">
        <h2>{editingId ? "Edit expense" : "Add a new expense"}</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Lunch"
            maxLength={100}
            required
          />

          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 250"
            required
          />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {["Food", "Travel", "Bills", "Shopping", "Other"].map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>

          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            max={today()}
            value={form.date}
            onChange={handleChange}
            required
          />

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update expense"
                  : "Add expense"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                  setMessage("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Your expenses</h2>

        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">
            No expenses yet. Add your first expense above!
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.title}</td>
                    <td>
                      {Number(expense.amount).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                    <td>{expense.category}</td>
                    <td>{expense.date}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(expense)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(expense._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
