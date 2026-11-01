import { StatTileSkeleton } from "@/shared/ui/molecules/StatTile";

export default function Loading() {
  return (
    <div aria-busy className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <StatTileSkeleton key={index} />
      ))}
    </div>
  );
}
