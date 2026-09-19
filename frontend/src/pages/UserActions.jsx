import ActionFeed from "../components/actions/ActionFeed";

const UserActions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 pb-24 md:pb-6">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 px-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Eco Community Feed</h1>
          <p className="mt-1 text-sm text-slate-600">
            Share your sustainable actions with the community.
          </p>
        </div>

        <ActionFeed />
      </div>
    </div>
  );
};

export default UserActions;
