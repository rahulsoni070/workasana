const OwnerSelect = ({ value, onChange, users }) => {
  const selected = users.filter((u) => value.includes(u._id));
  const available = users.filter((u) => !value.includes(u._id));

  return (
    <div className="owner-select">
      {selected.length > 0 && (
        <div className="owner-chips">
          {selected.map((u) => (
            <span key={u._id} className="owner-chip">
              {u.name}
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== u._id))}
                aria-label={`Remove ${u.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) onChange([...value, e.target.value]);
        }}
      >
        <option value="">
          {available.length ? "Add owner…" : "All users added"}
        </option>
        {available.map((u) => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>
    </div>
  );
};

export default OwnerSelect;