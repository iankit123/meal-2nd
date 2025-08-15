import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AuthSetupNoticeProps {
  show: boolean;
}

export default function AuthSetupNotice({ show }: AuthSetupNoticeProps) {
  if (!show) return null;

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Firebase Authentication Setup Required</AlertTitle>
      <AlertDescription className="text-orange-700 space-y-4">
        <p>Your app needs Firebase Authentication and Storage setup. Follow these steps:</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Step 1: Enable Authentication</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
              <li>Go to <strong>Firebase Console</strong> → Your Project → <strong>Authentication</strong></li>
              <li>Click <strong>"Get Started"</strong> or <strong>"Set up sign-in method"</strong></li>
              <li>In the <strong>Sign-in methods</strong> tab, find <strong>"Anonymous"</strong></li>
              <li>Click on <strong>Anonymous</strong> and toggle it <strong>ON</strong></li>
              <li>Click <strong>Save</strong></li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Step 2: Setup Storage Rules</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
              <li>Go to <strong>Storage</strong> in your Firebase Console</li>
              <li>Click <strong>"Get Started"</strong> if not already set up</li>
              <li>Go to the <strong>"Rules"</strong> tab</li>
              <li>Replace the rules with this code:</li>
            </ol>
            <div className="bg-orange-100 p-3 rounded text-xs font-mono mt-2 overflow-x-auto">
              <pre>{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recipes/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}</pre>
            </div>
            <p className="text-xs mt-2">Then click <strong>"Publish"</strong></p>
          </div>
          
          <p className="text-sm"><strong>After completing both steps, refresh this page.</strong></p>
        </div>

        <div className="pt-2 flex gap-2 flex-wrap">
          <Button
            onClick={() => window.open('https://console.firebase.google.com/project/meal-2nd/authentication', '_blank')}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Authentication
          </Button>
          <Button
            onClick={() => window.open('https://console.firebase.google.com/project/meal-2nd/storage', '_blank')}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Storage
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}