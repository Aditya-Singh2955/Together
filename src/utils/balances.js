export const isSettlement = (expense) =>
  !!expense?.isSettlement || expense?.title === "Settle Up";

export const computeMemberBalances = (members, expenses) => {
  const memberBalances = {};
  members.forEach((m) => {
    memberBalances[m.uid] = 0;
  });

  expenses.forEach((exp) => {
    const amt = parseFloat(exp.amount) || 0;
    const payerUid = exp.paidBy;
    const splitAmong = exp.splitAmong || [];
    const splitCount = splitAmong.length || 1;
    const costPerPerson = amt / splitCount;

    if (memberBalances[payerUid] !== undefined) {
      memberBalances[payerUid] += amt;
    }
    splitAmong.forEach((splitUid) => {
      if (memberBalances[splitUid] !== undefined) {
        memberBalances[splitUid] -= costPerPerson;
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
