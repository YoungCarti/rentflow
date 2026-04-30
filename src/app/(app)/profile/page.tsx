import PageHeader from "@/components/layout/PageHeader";
import ProfileSettings from "@/components/settings/ProfileSettings";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Profile"
        summary="Manage your personal information"
      />

      <ProfileSettings showHeading={false} />
    </div>
  );
}
