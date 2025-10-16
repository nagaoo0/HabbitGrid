import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import ColorPicker from '../components/ColorPicker';
import { getHabit, saveHabit, updateHabit } from '../lib/storage';

const AddEditHabitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isEdit) {
      const habit = getHabit(id);
      if (habit) {
        setName(habit.name);
        setColor(habit.color);
        if (habit.category) setCategory(habit.category);
      } else {
        toast({
          title: "Habit not found",
          description: "This habit doesn't exist or was deleted.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [id, isEdit, navigate, toast]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    if (isEdit) {
      updateHabit(id, { name: name.trim(), color, category: category.trim() });
      toast({
        title: "✅ Habit updated",
        description: "Your habit has been updated successfully.",
      });
    } else {
      saveHabit({
        name: name.trim(),
        color,
        category: category.trim(),
        completions: [],
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "✅ Habit created",
        description: "Your new habit is ready to track!",
      });
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Habit' : 'Create New Habit'}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update your habit details' : 'Start building a new habit'}
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise, Read 30 Minutes, Meditate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/50 characters
              </p>
            </div>

            {/* Category Input */}
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input
                id="category"
                placeholder="e.g., Health, Reading, Mindfulness"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-lg"
                maxLength={30}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Habit Color</Label>
              <ColorPicker selectedColor={color} onColorChange={setColor} />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{name || 'Your Habit Name'}</span>
                  {category && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200">{category}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: i < 7 ? color : 'transparent',
                        opacity: i < 7 ? 0.3 + (i * 0.1) : 1,
                        border: `1px solid ${color}20`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddEditHabitPage;