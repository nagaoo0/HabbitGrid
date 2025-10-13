import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PRESET_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f97316', // orange
];

const ColorPicker = ({ selectedColor, onColorChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorChange(color)}
            className="relative w-12 h-12 rounded-xl transition-all"
            style={{
              backgroundColor: color,
              boxShadow: selectedColor === color
                ? `0 0 0 3px ${color}40`
                : 'none',
            }}
          >
            {selectedColor === color && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Custom Color</p>
          <p className="text-xs text-muted-foreground">{selectedColor}</p>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;