export const isSettlement = (expense) =>
  !!expense?.isSettlement || expense?.title === "Settle Up";

export const getPersonShare = (expense, uid) => {
  const amt = parseFloat(expense.amount) || 0;
  const splitAmong = expense.splitAmong || [];
  if (!splitAmong.includes(uid)) return 0;

  const type = expense.splitType || "equal";
  const shares = expense.shares || {};

  if (type === "amount") {
    return parseFloat(shares[uid]) || 0;
  }
  if (type === "percent") {
    return (amt * (parseFloat(shares[uid]) || 0)) / 100;
  }
  return amt / (splitAmong.length || 1);
};

export const getUserNetOnExpense = (expense, uid) => {
  const amt = parseFloat(expense.amount) || 0;
  const isPayer = expense.paidBy === uid;
  const inSplit = (expense.splitAmong || []).includes(uid);
  const share = getPersonShare(expense, uid);

  if (isPayer && inSplit) return amt - share;
  if (isPayer && !inSplit) return amt;
  if (!isPayer && inSplit) return -share;
  return 0;
};

export const computeMemberBalances = (members, expenses) => {
  const memberBalances = {};
  members.forEach((m) => {
    memberBalances[m.uid] = 0;
  });

  expenses.forEach((exp) => {
    const amt = parseFloat(exp.amount) || 0;
    const payerUid = exp.paidBy;
    const splitAmong = exp.splitAmong || [];

    if (memberBalances[payerUid] !== undefined) {
      memberBalances[payerUid] += amt;
    }
    splitAmong.forEach((splitUid) => {
      if (memberBalances[splitUid] !== undefined) {
        memberBalances[splitUid] -= getPersonShare(exp, splitUid);
      }
    });
  });

  return memberBalances;
};

export const getSettleRelation = (myUid, otherUid, balances) => {
  const myBal = balances[myUid] || 0;
  const otherBal = balances[otherUid] || 0;

  if (myBal < -0.01 && otherBal > 0.01) {
    return {
      type: "you_owe",
      amount: Math.min(Math.abs(myBal), otherBal),
    };
  }
  if (otherBal < -0.01 && myBal > 0.01) {
    return {
      type: "owes_you",
      amount: Math.min(Math.abs(otherBal), myBal),
    };
  }
  return { type: "settled", amount: 0 };
};
