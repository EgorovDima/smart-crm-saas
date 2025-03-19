
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
import { Mail, Search, PlusCircle, Trash2, Archive, Star, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '307019110275-jnlvunpcfe1fnjjb9133ggmu93eoj3vb.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = window.location.origin + '/gmail';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

const GmailIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emails, setEmails] = useState<Array<{id: string, from: string, subject: string, date: string, read: boolean}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if Gmail is connected on component mount
  useEffect(() => {
    checkGmailConnection();
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleGoogleCallback(code);
      // Remove code from URL for cleanliness
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const checkGmailConnection = () => {
    // Check if we have a token in localStorage
    const gmailToken = localStorage.getItem('gmail_access_token');
    const tokenExpiry = localStorage.getItem('gmail_token_expiry');
    
    if (gmailToken && tokenExpiry) {
      // Check if token is still valid
      if (new Date().getTime() < parseInt(tokenExpiry)) {
        setIsConnected(true);
        fetchEmails(gmailToken);
      } else {
        // Token expired, remove it
        localStorage.removeItem('gmail_access_token');
        localStorage.removeItem('gmail_token_expiry');
        setIsConnected(false);
      }
    }
  };
  
  const connectToGmail = () => {
    toast({
      title: "Connecting to Gmail",
      description: "Redirecting to Google authentication..."
    });
    
    // Construct the OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(GMAIL_SCOPES)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&login_hint=${encodeURIComponent('logisticstoukraine@gmail.com')}`;
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };
  
  const handleGoogleCallback = async (code: string) => {
    try {
      // Exchange authorization code for tokens
      // Note: In a production app, this should be done server-side to protect your client secret
      // For this example, we're doing it client-side but this is not recommended for real applications
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', GOOGLE_CLIENT_ID);
      params.append('client_secret', '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'); // Normally this should be kept server-side
      params.append('redirect_uri', GOOGLE_REDIRECT_URI);
      params.append('grant_type', 'authorization_code');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }
      
      const data = await response.json();
      
      // Save tokens to localStorage (in a real app, consider using a more secure storage method)
      localStorage.setItem('gmail_access_token', data.access_token);
      localStorage.setItem('gmail_refresh_token', data.refresh_token);
      
      // Calculate expiry time
      const expiryTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('gmail_token_expiry', expiryTime.toString());
      
      setIsConnected(true);
      toast({
        title: "Successfully connected",
        description: "Your Gmail account has been connected to AI Smart Logistics."
      });
      
      // Fetch emails using the new token
      fetchEmails(data.access_token);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Gmail. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const fetchEmails = async (token: string) => {
    setIsLoadingEmails(true);
    try {
      // Get list of messages
      const messagesResponse = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10', 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch email list');
      }
      
      const messagesData = await messagesResponse.json();
      
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
          throw new Error(`Failed to fetch email ${message.id}`);
        }
        
        return messageResponse.json();
      });
      
      const emailsData = await Promise.all(emailPromises);
      
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
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: "Error fetching emails",
        description: "Could not retrieve emails from Gmail. Please try reconnecting.",
        variant: "destructive"
      });
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
    }
  };
  
  const filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('gmail_access_token');
    if (!token) return;
    
    try {
      // Mark message as read in Gmail
      await fetch(
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
      
      // Update local state
      setEmails(emails.map(email => 
        email.id === id ? { ...email, read: true } : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
      toast({
        title: "Error",
        description: "Could not mark email as read.",
        variant: "destructive"
      });
    }
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
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        )}
      </div>
      
      {!isConnected ? (
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
              <p>Connect with the following email: logisticstoukraine@gmail.com</p>
              <div className="flex justify-start">
                <Button onClick={connectToGmail} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="mr-2 h-4 w-4" /> Connect to Gmail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
              <Button variant="outline" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
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
                <Button>
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
      )}
    </div>
  );
};

export default GmailIntegration;
