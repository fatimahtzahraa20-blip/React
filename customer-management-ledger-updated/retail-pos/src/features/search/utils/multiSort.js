function compareValues(left, right) {
  const leftValue = left ?? "";
  const rightValue = right ?? "";
  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }
  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function multiSort(rows, sorts) {
  const fields = {
    relevance: "rank",
    date: "occurred_at",
    title: "title",
    amount: "amount",
    type: "entity_type",
  };

  return [...rows].sort((left, right) => {
    for (const sort of sorts) {
      const key = fields[sort.key] || sort.key;
      const result = compareValues(left[key], right[key]);
      if (result !== 0) return sort.direction === "asc" ? result : -result;
    }
    return 0;
  });
}
