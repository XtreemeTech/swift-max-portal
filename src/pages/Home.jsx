import SalaryForm from "../components/SalaryForm";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        {/* soft glow background */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-orange-200/30 to-red-200/30 blur-2xl"></div>

        <div className="relative">
          <SalaryForm />
        </div>
      </div>
    </main>
  );
}