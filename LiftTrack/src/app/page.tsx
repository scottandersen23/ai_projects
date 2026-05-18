import { PostWorkoutButton } from "../components/post-workout-button";
import { RightPanel } from "../components/right-panel";
import { Sidebar } from "../components/sidebar";
import { WorkoutExerciseList } from "../components/workout-exercise-list";
import { WorkoutPageHeader } from "../components/workout-page-header";

export default function WorkoutPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0B0F19]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <WorkoutPageHeader />

          <WorkoutExerciseList />

          <PostWorkoutButton />
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
