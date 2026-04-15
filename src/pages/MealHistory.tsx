import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { historyMeals } from '@/data/mockData';
import { Search, Filter } from 'lucide-react';

const MealHistory = () => {
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');

  const dates = [...new Set(historyMeals.map(m => m.date))].sort().reverse();

  const filtered = historyMeals.filter(m => {
    if (selectedDate !== 'all' && m.date !== selectedDate) return false;
    if (selectedType !== 'all' && m.type !== selectedType) return false;
    if (search && !m.typeLabel.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedByDate = filtered.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const formatDate = (d: string) => {
    if (d === '2026-04-15') return 'Hoje — 15/04';
    if (d === '2026-04-14') return 'Ontem — 14/04';
    return d.split('-').reverse().join('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-heading font-bold text-foreground">Histórico de Refeições</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} refeições registradas</p>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar refeição..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <FilterChip label="Todos" active={selectedDate === 'all'} onClick={() => setSelectedDate('all')} />
          {dates.map(d => (
            <FilterChip key={d} label={d === '2026-04-15' ? 'Hoje' : d === '2026-04-14' ? 'Ontem' : d.slice(5)} active={selectedDate === d} onClick={() => setSelectedDate(d)} />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <FilterChip label="Todos" active={selectedType === 'all'} onClick={() => setSelectedType('all')} />
          <FilterChip label="Café" active={selectedType === 'cafe'} onClick={() => setSelectedType('cafe')} />
          <FilterChip label="Almoço" active={selectedType === 'almoco'} onClick={() => setSelectedType('almoco')} />
          <FilterChip label="Jantar" active={selectedType === 'jantar'} onClick={() => setSelectedType('jantar')} />
          <FilterChip label="Lanche" active={selectedType === 'lanche'} onClick={() => setSelectedType('lanche')} />
        </div>

        {/* Meals List */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {Object.entries(groupedByDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, meals]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{formatDate(date)}</p>
              <div className="space-y-2">
                {meals.map(meal => (
                  <div key={meal.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                      {meal.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{meal.typeLabel}</p>
                      <p className="text-xs text-muted-foreground">{meal.time} • {meal.origin}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{meal.calories} kcal</p>
                      <p className="text-[10px] text-muted-foreground">{meal.protein}g P • {meal.carbs}g C</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
      active ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
    }`}
  >
    {label}
  </button>
);

export default MealHistory;
