
import React, { useState } from 'react';
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

const GmailIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emails, setEmails] = useState<Array<{id: string, from: string, subject: string, date: string, read: boolean}>>([
    { id: '1', from: 'john@example.com', subject: 'New shipping request', date: '2023-07-22 09:35', read: true },
    { id: '2', from: 'logistics@fastfreight.com', subject: 'Delivery confirmation', date: '2023-07-21 14:22', read: false },
    { id: '3', from: 'support@customs.gov', subject: 'Documentation needed', date: '2023-07-20 11:03', read: false },
    { id: '4', from: 'maria@clientcompany.com', subject: 'Order status request', date: '2023-07-19 16:40', read: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const connectToGmail = () => {
    // In real implementation, this would redirect to Google OAuth consent screen
    toast({
      title: "Connecting to Gmail",
      description: "Redirecting to Google authentication..."
    });
    
    // Simulate successful connection after 2 seconds
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Successfully connected",
        description: "Your Gmail account has been connected to AI Smart Logistics."
      });
    }, 2000);
  };
  
  const filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = (id: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, read: true } : email
    ));
  };
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing emails",
      description: "Syncing with Gmail..."
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
