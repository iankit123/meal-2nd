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
        <p>Your app is working with temporary authentication. To enable full functionality:</p>
        
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to <strong>Firebase Console</strong> → Your Project → <strong>Authentication</strong></li>
          <li>Click <strong>"Get Started"</strong> or <strong>"Set up sign-in method"</strong></li>
          <li>In the <strong>Sign-in methods</strong> tab, find <strong>"Anonymous"</strong></li>
          <li>Click on <strong>Anonymous</strong> and toggle it <strong>ON</strong></li>
          <li>Click <strong>Save</strong></li>
          <li>Refresh this page</li>
        </ol>

        <div className="pt-2">
          <Button
            onClick={() => window.open('https://console.firebase.google.com/project/meal-2nd/authentication', '_blank')}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Firebase Console
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}