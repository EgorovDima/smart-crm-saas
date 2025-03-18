
import React, { useState, useRef } from 'react';
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
import { Plus, Calendar as CalendarIcon, UploadCloud } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Carrier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  nextContactDate: Date | undefined;
};

const initialCarriers: Carrier[] = [
  {
    id: '1',
    name: 'FastTrack Logistics',
    email: 'operations@fasttracklogistics.com',
    phone: '+1 (555) 987-6543',
    website: 'www.fasttracklogistics.com',
    country: 'United States',
    nextContactDate: new Date('2023-07-22')
  },
  {
    id: '2',
    name: 'Euro Freight Services',
    email: 'contact@eurofreight.eu',
    phone: '+33 1 2345 6789',
    website: 'www.eurofreight.eu',
    country: 'France',
    nextContactDate: new Date('2023-07-18')
  },
  {
    id: '3',
    name: 'Pacific Transport Co.',
    email: 'info@pacifictransport.com',
    phone: '+61 2 9876 5432',
    website: 'www.pacifictransport.com',
    country: 'Australia',
    nextContactDate: new Date('2023-07-30')
  }
];

const Carriers = () => {
  const [carriers, setCarriers] = useState<Carrier[]>(initialCarriers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCarrier, setNewCarrier] = useState<Partial<Carrier>>({
    name: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    nextContactDate: undefined
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddNewCarrier = () => {
    if (!newCarrier.name || !newCarrier.email) return;

    const carrier: Carrier = {
      id: Date.now().toString(),
      name: newCarrier.name || '',
      email: newCarrier.email || '',
      phone: newCarrier.phone || '',
      website: newCarrier.website || '',
      country: newCarrier.country || '',
      nextContactDate: newCarrier.nextContactDate
    };

    setCarriers([...carriers, carrier]);
    setIsDialogOpen(false);
    setNewCarrier({
      name: '',
      email: '',
      phone: '',
      website: '',
      country: '',
      nextContactDate: undefined
    });
    setDate(undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file",
        variant: "destructive",
      });
      return;
    }

    // Here we would normally process the file, but for now just show a success message
    toast({
      title: "File uploaded",
      description: `${file.name} has been successfully uploaded`,
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrier Management</h1>
          <p className="text-lg text-muted-foreground">Manage your carriers and import statistical data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fileInputRef.current?.click()} className="bg-green-600 hover:bg-green-700">
            <UploadCloud className="mr-2 h-4 w-4" /> Import Excel/CSV
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gray-800 hover:bg-gray-900">
            <Plus className="mr-2 h-4 w-4" /> Add New Carrier
          </Button>
        </div>
      </div>

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
            {carriers.map((carrier) => (
              <TableRow key={carrier.id}>
                <TableCell className="font-medium">{carrier.name}</TableCell>
                <TableCell>{carrier.email}</TableCell>
                <TableCell>{carrier.phone}</TableCell>
                <TableCell>
                  <a href={`https://${carrier.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {carrier.website}
                  </a>
                </TableCell>
                <TableCell>{carrier.country}</TableCell>
                <TableCell>
                  {carrier.nextContactDate ? format(carrier.nextContactDate, 'PPP') : 'Not scheduled'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="carrier-name">Carrier Name</Label>
              <Input 
                id="carrier-name" 
                value={newCarrier.name} 
                onChange={(e) => setNewCarrier({...newCarrier, name: e.target.value})} 
                placeholder="Enter carrier name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carrier-email">Email</Label>
              <Input 
                id="carrier-email" 
                type="email"
                value={newCarrier.email} 
                onChange={(e) => setNewCarrier({...newCarrier, email: e.target.value})} 
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="carrier-phone">Phone</Label>
              <Input 
                id="carrier-phone" 
                value={newCarrier.phone} 
                onChange={(e) => setNewCarrier({...newCarrier, phone: e.target.value})} 
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="carrier-website">Website</Label>
                <Input 
                  id="carrier-website" 
                  value={newCarrier.website} 
                  onChange={(e) => setNewCarrier({...newCarrier, website: e.target.value})} 
                  placeholder="Enter website URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carrier-country">Country</Label>
                <Input 
                  id="carrier-country" 
                  value={newCarrier.country} 
                  onChange={(e) => setNewCarrier({...newCarrier, country: e.target.value})} 
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
                      setNewCarrier({...newCarrier, nextContactDate: date});
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewCarrier}>Add Carrier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Carriers;
