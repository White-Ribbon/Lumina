import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { authService } from '@/services/auth';

const BackendTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      // Test basic health check
      const healthResponse = await fetch('http://localhost:8000/health');
      const healthData = await healthResponse.json();

      // Test galaxies endpoint
      const galaxiesResponse = await fetch('http://localhost:8000/api/galaxies');
      const galaxiesData = await galaxiesResponse.json();

      setTestResults({
        health: healthData,
        galaxies: galaxiesData,
        status: 'success'
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      // Test login with admin credentials
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@cosmicprojectforge.com',
          password: 'admin123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        // Test authenticated endpoint
        const userResponse = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${loginData.access_token}` }
        });
        const userData = await userResponse.json();

        setTestResults({
          login: loginData,
          user: userData,
          status: 'success'
        });
      } else {
        const errorData = await loginResponse.json();
        setTestResults({
          error: errorData.detail || 'Login failed',
          status: 'error'
        });
      }
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Backend Connection Test</CardTitle>
          <CardDescription>
            Test the connection between frontend and backend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testBackendConnection} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Testing...' : 'Test Basic Connection'}
            </Button>
            <Button 
              onClick={testAuth} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? 'Testing...' : 'Test Authentication'}
            </Button>
          </div>

          {testResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className={testResults.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {testResults.status === 'success' ? '✅ Test Successful' : '❌ Test Failed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Backend URL:</strong> http://localhost:8000</p>
            <p><strong>API Docs:</strong> http://localhost:8000/docs</p>
            <p><strong>Admin Credentials:</strong> admin@cosmicprojectforge.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendTest;
