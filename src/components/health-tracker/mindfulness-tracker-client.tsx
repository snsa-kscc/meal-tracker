"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MindfulnessEntry, DailyHealthMetrics } from "@/types/health-metrics";
import { ArrowLeft, BrainIcon, Timer } from "lucide-react";
import { MINDFULNESS_TRACKER_CONFIG } from "@/data/mindfulness-tracker";
import { addMindfulness } from "@/app/actions/health-actions";

interface MindfulnessTrackerClientProps {
  userId: string;
  initialMindfulnessData: DailyHealthMetrics | null;
}

export function MindfulnessTrackerClient({ userId, initialMindfulnessData }: MindfulnessTrackerClientProps) {
  const router = useRouter();
  const [minutes, setMinutes] = useState<number>(MINDFULNESS_TRACKER_CONFIG.defaultDuration);
  const [activity, setActivity] = useState<string>(MINDFULNESS_TRACKER_CONFIG.meditationTypes[0].id);
  const [mindfulnessEntries, setMindfulnessEntries] = useState<MindfulnessEntry[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [dailyGoal] = useState<number>(Math.round(MINDFULNESS_TRACKER_CONFIG.weeklyGoal / 7)); // Daily goal based on weekly goal
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize with data if available
  useEffect(() => {
    if (initialMindfulnessData?.mindfulness) {
      setMindfulnessEntries(initialMindfulnessData.mindfulness);
      
      // Calculate total
      const total = initialMindfulnessData.mindfulness.reduce((sum, entry) => sum + entry.minutes, 0);
      setTotalMinutes(total);
    }
  }, [initialMindfulnessData]);
  
  const handleAddMindfulness = async () => {
    if (minutes <= 0 || !userId) return;
    
    try {
      setIsLoading(true);
      
      const newEntry: MindfulnessEntry = {
        minutes: minutes,
        activity: activity,
        timestamp: new Date()
      };
      
      // Save to database
      await addMindfulness(userId, new Date(), newEntry);
      
      // Update local state
      const updatedEntries = [...mindfulnessEntries, newEntry];
      const newTotal = totalMinutes + minutes;
      
      setMindfulnessEntries(updatedEntries);
      setTotalMinutes(newTotal);
    } catch (error) {
      console.error("Failed to save mindfulness data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const progressPercentage = Math.min(100, (totalMinutes / dailyGoal) * 100);
  
  const activityOptions = MINDFULNESS_TRACKER_CONFIG.meditationTypes.map(type => ({
    value: type.id,
    label: type.label
  }));
  
  return (
    <div className="py-6 font-sans">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 h-9 w-9" 
          onClick={() => router.push('/tracker')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Mindfulness Tracker</h1>
      </div>
      
      {/* Mindfulness Progress Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <BrainIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Mindfulness Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Daily Progress</span>
            <span className="text-sm font-medium">{totalMinutes} / {dailyGoal} minutes</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Mindfulness visualization */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="10"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progressPercentage / 100)}
                  transform="rotate(-90 50 50)"
                />
                <text 
                  x="50" 
                  y="50" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#6366f1"
                >
                  {totalMinutes}
                </text>
                <text 
                  x="50" 
                  y="65" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="#6b7280"
                >
                  minutes
                </text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Mindfulness Entry Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Log Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Activity Type
              </label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm">{minutes} min</span>
                <Slider
                  value={[minutes]}
                  min={1}
                  max={MINDFULNESS_TRACKER_CONFIG.durationOptions[MINDFULNESS_TRACKER_CONFIG.durationOptions.length - 1]}
                  step={1}
                  onValueChange={(value) => setMinutes(value[0])}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Quick add buttons */}
            <div className="grid grid-cols-3 gap-2">
              {MINDFULNESS_TRACKER_CONFIG.durationOptions.slice(0, 3).map((mins) => (
                <Button 
                  key={mins}
                  variant="outline" 
                  size="sm"
                  onClick={() => setMinutes(mins)}
                  className={minutes === mins ? "border-indigo-500 text-indigo-500" : ""}
                >
                  {mins} min
                </Button>
              ))}
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleAddMindfulness}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Log Practice"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Mindfulness History */}
      {mindfulnessEntries.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Today's Practices</h2>
          <div className="space-y-2">
            {mindfulnessEntries.slice().reverse().map((entry, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <BrainIcon className="h-4 w-4 mr-2 text-indigo-500" />
                  <div>
                    <div className="font-medium">{entry.activity.charAt(0).toUpperCase() + entry.activity.slice(1)}</div>
                    <div className="text-xs text-gray-500">{entry.minutes} minutes</div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mindfulness Tips */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mindfulness Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-1 mr-2 mt-0.5">
                <BrainIcon className="h-3 w-3" />
              </div>
              <span>Start with just 5 minutes a day and gradually increase</span>
            </li>
            <li className="flex items-start">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-1 mr-2 mt-0.5">
                <BrainIcon className="h-3 w-3" />
              </div>
              <span>Focus on your breath when your mind wanders</span>
            </li>
            <li className="flex items-start">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-1 mr-2 mt-0.5">
                <BrainIcon className="h-3 w-3" />
              </div>
              <span>Practice at the same time each day to build a habit</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
