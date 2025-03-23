
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Mail, Search, PlusCircle, Trash2, Archive, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Google OAuth Configuration with your provided credentials
const GOOGLE_CLIENT_ID = '307019110275-jnlvunpcfe1fnjjb9133ggmu93eoj3vb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
// Fix: Make sure the redirect URI exactly matches what's configured in Google Cloud Console
// Using /gmail instead of anything else
const GOOGLE_REDIRECT_URI = `${window.location.origin}/gmail`;
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels';

const GmailIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emails, setEmails] = useState<Array<{id: string, from: string, subject: string, date: string, read: boolean}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Clear any URL parameters on component mount to avoid issues with OAuth flow
  useEffect(() => {
    console.log("GmailIntegration component mounted");
    
    if (window.location.search) {
      // Keep the code parameter for processing, but clear it after
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      console.log("URL has search params. Code exists:", !!code, "Error exists:", !!error);
      
      if (code) {
        handleGoogleCallback(code);
        // Remove code from URL for cleanliness
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (error) {
        setError(`Google Auth Error: ${error}`);
        toast({
          title: "Authentication Error",
          description: `Google returned an error: ${error}`,
          variant: "destructive"
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Check if Gmail is connected
    checkGmailConnection();
  }, []);
  
  const checkGmailConnection = () => {
    // Check if we have a token in localStorage
    const gmailToken = localStorage.getItem('gmail_access_token');
    const tokenExpiry = localStorage.getItem('gmail_token_expiry');
    
    console.log("Checking Gmail connection...");
    console.log("Access token exists:", !!gmailToken);
    console.log("Token expiry exists:", !!tokenExpiry);
    
    if (gmailToken && tokenExpiry) {
      // Check if token is still valid
      if (new Date().getTime() < parseInt(tokenExpiry)) {
        console.log("Token is still valid, expiry:", new Date(parseInt(tokenExpiry)).toLocaleString());
        setIsConnected(true);
        fetchEmails(gmailToken);
      } else {
        console.log("Token has expired, attempting to refresh");
        // Token expired, try to refresh it
        const refreshToken = localStorage.getItem('gmail_refresh_token');
        if (refreshToken) {
          refreshAccessToken(refreshToken);
        } else {
          // No refresh token, remove expired token
          console.log("No refresh token available, clearing expired tokens");
          localStorage.removeItem('gmail_access_token');
          localStorage.removeItem('gmail_token_expiry');
          setIsConnected(false);
          setError("Authentication session expired. Please reconnect.");
        }
      }
    } else {
      console.log("No Gmail tokens found in localStorage");
    }
  };
  
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      console.log("Refreshing access token...");
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams();
      params.append('client_id', GOOGLE_CLIENT_ID);
      params.append('client_secret', GOOGLE_CLIENT_SECRET);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh error response:', errorData);
        throw new Error(`Failed to refresh token: ${errorData.error_description || errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Token refresh successful");
      
      // Save new access token
      localStorage.setItem('gmail_access_token', data.access_token);
      
      // Calculate expiry time
      const expiryTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('gmail_token_expiry', expiryTime.toString());
      
      setIsConnected(true);
      setError(null);
      fetchEmails(data.access_token);
      
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear all tokens on refresh failure
      localStorage.removeItem('gmail_access_token');
      localStorage.removeItem('gmail_refresh_token');
      localStorage.removeItem('gmail_token_expiry');
      setIsConnected(false);
      setError("Authentication session expired and couldn't be refreshed. Please reconnect.");
      
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to refresh authentication. Please reconnect.",
        variant: "destructive"
      });
    }
  };
  
  const connectToGmail = () => {
    setError(null);
    
    // Clear any existing tokens before starting a new OAuth flow
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_refresh_token');
    localStorage.removeItem('gmail_token_expiry');
    
    toast({
      title: "Connecting to Gmail",
      description: "Redirecting to Google authentication..."
    });
    
    console.log("Starting Gmail OAuth flow");
    
    // Construct the OAuth URL with extra parameters to ensure correct login
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(GMAIL_SCOPES)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&include_granted_scopes=true` +
      `&login_hint=${encodeURIComponent('logisticstoukraine@gmail.com')}`;
    
    console.log("Auth URL:", authUrl);
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };
  
  const handleGoogleCallback = async (code: string) => {
    setIsLoadingEmails(true);
    setError(null);
    try {
      console.log("Received auth code, exchanging for tokens...");
      
      // Exchange authorization code for tokens
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', GOOGLE_CLIENT_ID);
      params.append('client_secret', GOOGLE_CLIENT_SECRET);
      params.append('redirect_uri', GOOGLE_REDIRECT_URI);
      params.append('grant_type', 'authorization_code');
      
      console.log("Token exchange parameters:", {
        code: "REDACTED",
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      });
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token exchange error response:', errorData);
        throw new Error(`Failed to exchange code for tokens: ${errorData.error_description || errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Token exchange successful, received tokens");
      
      // Save tokens to localStorage
      localStorage.setItem('gmail_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('gmail_refresh_token', data.refresh_token);
        console.log("Refresh token saved");
      } else {
        console.log("No refresh token received - user may have previously granted access");
        // If no refresh token is received, try to use previously stored one
        const existingRefreshToken = localStorage.getItem('gmail_refresh_token');
        if (!existingRefreshToken) {
          console.log("No existing refresh token found, reconnection may be required in the future");
        }
      }
      
      // Calculate expiry time
      const expiryTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('gmail_token_expiry', expiryTime.toString());
      console.log("Token expiry set to:", new Date(expiryTime).toLocaleString());
      
      setIsConnected(true);
      toast({
        title: "Successfully connected",
        description: "Your Gmail account has been connected to AI Smart Logistics."
      });
      
      // Fetch emails using the new token
      await fetchEmails(data.access_token);
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setError(error.message || "Authentication failed");
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to Gmail. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmails(false);
    }
  };
  
  const fetchEmails = async (token: string) => {
    setIsLoadingEmails(true);
    setError(null);
    try {
      console.log("Fetching emails...");
      // Get list of messages
      const messagesResponse = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX', 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        console.error('Email fetch error response:', errorData);
        
        // Check if the error is due to invalid token
        if (errorData.error?.code === 401 || errorData.error?.status === 'UNAUTHENTICATED') {
          console.log("Token is invalid, attempting to refresh");
          const refreshToken = localStorage.getItem('gmail_refresh_token');
          if (refreshToken) {
            await refreshAccessToken(refreshToken);
            return; // refreshAccessToken will call fetchEmails again
          }
        }
        
        throw new Error(`Failed to fetch email list: ${errorData.error?.message || messagesResponse.statusText}`);
      }
      
      const messagesData = await messagesResponse.json();
      console.log("Email list response:", messagesData);
      
      // If no messages, set empty array
      if (!messagesData.messages || messagesData.messages.length === 0) {
        console.log("No emails found");
        setEmails([]);
        setIsLoadingEmails(false);
        return;
      }
      
      // Fetch details for each message
      const emailPromises = messagesData.messages.map(async (message: {id: string}) => {
        const messageResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!messageResponse.ok) {
          console.error(`Failed to fetch email ${message.id}:`, await messageResponse.text());
          throw new Error(`Failed to fetch email ${message.id}`);
        }
        
        return messageResponse.json();
      });
      
      const emailsData = await Promise.all(emailPromises);
      console.log("Fetched detailed email data for", emailsData.length, "emails");
      
      // Process the emails
      const processedEmails = emailsData.map(email => {
        const headers = email.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
        const isUnread = email.labelIds && email.labelIds.includes('UNREAD');
        
        return {
          id: email.id,
          subject,
          from,
          date: new Date(date).toLocaleString(),
          read: !isUnread
        };
      });
      
      setEmails(processedEmails);
      console.log("Emails fetched successfully:", processedEmails.length);
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      setError(error.message || "Failed to fetch emails");
      toast({
        title: "Error fetching emails",
        description: error.message || "Could not retrieve emails from Gmail. Please try reconnecting.",
        variant: "destructive"
      });
      
      // If unauthorized, tokens might be invalid
      if (error.message?.includes('401') || error.message?.includes('auth')) {
        setIsConnected(false);
        localStorage.removeItem('gmail_access_token');
        toast({
          title: "Authentication expired",
          description: "Your Gmail session has expired. Please reconnect.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing emails",
      description: "Syncing with Gmail..."
    });
    
    const token = localStorage.getItem('gmail_access_token');
    if (token) {
      fetchEmails(token);
    } else {
      toast({
        title: "Authentication required",
        description: "Please reconnect your Gmail account",
        variant: "destructive"
      });
    }
  };
  
  const handleDisconnect = () => {
    // Clear tokens from Google's servers
    const token = localStorage.getItem('gmail_access_token');
    if (token) {
      // Revoke the token (best effort - don't wait for it)
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).catch(err => console.error("Error revoking token:", err));
    }
    
    // Remove tokens from localStorage
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_refresh_token');
    localStorage.removeItem('gmail_token_expiry');
    
    setIsConnected(false);
    setEmails([]);
    setError(null);
    
    toast({
      title: "Disconnected",
      description: "Your Gmail account has been disconnected."
    });
  };
  
  const filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) return;
    
    try {
      console.log("Marking email as read:", id);
      // Mark message as read in Gmail
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            removeLabelIds: ['UNREAD']
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error marking email as read:', errorData);
        throw new Error(errorData.error?.message || 'Failed to mark email as read');
      }
      
      // Update local state
      setEmails(emails.map(email => 
        email.id === id ? { ...email, read: true } : email
      ));
      
      console.log("Email marked as read successfully");
    } catch (error: any) {
      console.error('Error marking email as read:', error);
      toast({
        title: "Error",
        description: "Could not mark email as read: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };

  const composeEmail = () => {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please connect your Gmail account first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Coming Soon",
      description: "Email composition feature is under development"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gmail Integration</h1>
          <p className="text-lg text-muted-foreground">Connect and manage your emails directly from AI Smart Logistics</p>
        </div>
        {!isConnected ? (
          <Button onClick={connectToGmail} className="bg-blue-600 hover:bg-blue-700">
            <Mail className="mr-2 h-4 w-4" /> Connect Gmail
          </Button>
        ) : (
          <div className="space-x-2 flex">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              Disconnect
            </Button>
          </div>
        )}
      </div>
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Connection Error</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                className="mt-2 bg-red-600 hover:bg-red-700" 
                size="sm"
                onClick={connectToGmail}
              >
                Try Reconnecting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isConnected && !error ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Connect your Gmail account</CardTitle>
            <CardDescription>
              Link your Gmail account to send and receive emails directly from AI Smart Logistics CRM.
              This integration uses Google's secure OAuth 2.0 protocol.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p>Connect with the following email: <strong>logisticstoukraine@gmail.com</strong></p>
              <div className="flex justify-start">
                <Button onClick={connectToGmail} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="mr-2 h-4 w-4" /> Connect to Gmail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isConnected ? (
        <>
          <div className="flex justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="icon" title="Archive">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Star">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="inbox">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" className="mt-6">
              {isLoadingEmails ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Loading emails...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmails.map((email) => (
                        <TableRow 
                          key={email.id} 
                          className={email.read ? "" : "font-bold bg-blue-50"}
                          onClick={() => markAsRead(email.id)}
                        >
                          <TableCell>{email.from}</TableCell>
                          <TableCell>{email.subject}</TableCell>
                          <TableCell className="text-right">{email.date}</TableCell>
                        </TableRow>
                      ))}
                      {filteredEmails.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">No emails found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button onClick={composeEmail}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Compose New Email
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="sent">
              <div className="p-6 text-center text-muted-foreground">
                Sent emails will appear here.
              </div>
            </TabsContent>
            <TabsContent value="drafts">
              <div className="p-6 text-center text-muted-foreground">
                Draft emails will appear here.
              </div>
            </TabsContent>
            <TabsContent value="important">
              <div className="p-6 text-center text-muted-foreground">
                Important emails will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
};

export default GmailIntegration;
