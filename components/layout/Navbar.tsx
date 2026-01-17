import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function Navbar() {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                {/* Future: UserButton or Notifications */}
            </div>
        </div>
    );
}
