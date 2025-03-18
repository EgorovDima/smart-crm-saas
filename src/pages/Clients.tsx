
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  nextContactDate: Date | undefined;
  type: 'actual' | 'potential';
};

const initialClients: Client[] = [
  {
    id: '1',
    name: 'Logistics Partners Inc.',
    email: 'contact@logisticspartners.com',
    phone: '+1 (555) 123-4567',
    website: 'www.logisticspartners.com',
    country: 'United States',
    nextContactDate: new Date('2023-07-15'),
    type: 'actual'
  },
  {
    id: '2',
    name: 'Global Cargo Ltd.',
    email: 'info@globalcargo.com',
    phone: '+44 20 1234 5678',
    website: 'www.globalcargo.com',
    country: 'United Kingdom',
    nextContactDate: new Date('2023-07-20'),
    type: 'potential'
  },
  {
    id: '3',
    name: 'TransEuro Shipping',
    email: 'sales@transeuro.eu',
    phone: '+49 30 9876 5432',
    website: 'www.transeuro.eu',
    country: 'Germany',
    nextContactDate: new Date('2023-07-25'),
    type: 'actual'
  }
];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'actual' | 'potential'>('actual');
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    nextContactDate: undefined,
    type: 'actual'
  });
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleAddNewClient = () => {
    if (!newClient.name || !newClient.email) return;

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      website: newClient.website || '',
      country: newClient.country || '',
      nextContactDate: newClient.nextContactDate,
      type: newClient.type || 'actual'
    };

    setClients([...clients, client]);
    setIsDialogOpen(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      website: '',
      country: '',
      nextContactDate: undefined,
      type: 'actual'
    });
    setDate(undefined);
  };

  const filteredClients = clients.filter(client => client.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-lg text-muted-foreground">Manage your clients and schedule next contacts</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gray-800 hover:bg-gray-900">
          <Plus className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'actual' | 'potential')}>
        <TabsList>
          <TabsTrigger value="actual">Actual Clients</TabsTrigger>
          <TabsTrigger value="potential">Potential Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="actual" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Next Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {client.website}
                      </a>
                    </TableCell>
                    <TableCell>{client.country}</TableCell>
                    <TableCell>
                      {client.nextContactDate ? format(client.nextContactDate, 'PPP') : 'Not scheduled'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="potential" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Next Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {client.website}
                      </a>
                    </TableCell>
                    <TableCell>{client.country}</TableCell>
                    <TableCell>
                      {client.nextContactDate ? format(client.nextContactDate, 'PPP') : 'Not scheduled'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-type">Client Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="actual"
                    name="client-type"
                    value="actual"
                    checked={newClient.type === 'actual'}
                    onChange={() => setNewClient({...newClient, type: 'actual'})}
                    className="mr-2"
                  />
                  <Label htmlFor="actual">Actual Client</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="potential"
                    name="client-type"
                    value="potential"
                    checked={newClient.type === 'potential'}
                    onChange={() => setNewClient({...newClient, type: 'potential'})}
                    className="mr-2"
                  />
                  <Label htmlFor="potential">Potential Client</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input 
                id="client-name" 
                value={newClient.name} 
                onChange={(e) => setNewClient({...newClient, name: e.target.value})} 
                placeholder="Enter client name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-email">Email</Label>
              <Input 
                id="client-email" 
                type="email"
                value={newClient.email} 
                onChange={(e) => setNewClient({...newClient, email: e.target.value})} 
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input 
                id="client-phone" 
                value={newClient.phone} 
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})} 
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client-website">Website</Label>
                <Input 
                  id="client-website" 
                  value={newClient.website} 
                  onChange={(e) => setNewClient({...newClient, website: e.target.value})} 
                  placeholder="Enter website URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-country">Country</Label>
                <Input 
                  id="client-country" 
                  value={newClient.country} 
                  onChange={(e) => setNewClient({...newClient, country: e.target.value})} 
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="next-contact">Next Contact Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setNewClient({...newClient, nextContactDate: date});
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
