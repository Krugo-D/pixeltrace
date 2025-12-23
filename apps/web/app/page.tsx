import UploadZone from '@/components/UploadZone';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">PixelTrace</h1>
          <p className="text-lg text-gray-600">
            Assess IP and commercial risk in AI-generated images
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Upload an image to receive a comprehensive risk assessment across multiple
            dimensions including trademark, copyright, and commercial usage concerns.
          </p>
        </div>
        <UploadZone />
        <div className="text-center text-xs text-gray-400 mt-8">
          <p>
            This is a proof-of-concept tool. Results are indicative and should not be
            considered legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}

