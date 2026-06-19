const PrizeEngine = {
  pick: (prizes) => {
    const total = prizes.reduce((s, p) => s + p.weight, 0);
    let rand = Math.random() * total;
    for (const prize of prizes) {
      rand -= prize.weight;
      if (rand <= 0) return prize.value;
    }
    return prizes[prizes.length - 1].value;
  },
  
  getOdds: (prizes) => {
    if (!prizes || prizes.length === 0) return [];
    const total = prizes.reduce((s, p) => s + p.weight, 0);
    return prizes.map(p => ({ 
      ...p, 
      pct: ((p.weight / total) * 100).toFixed(0) 
    }));
  },
};

export default PrizeEngine;