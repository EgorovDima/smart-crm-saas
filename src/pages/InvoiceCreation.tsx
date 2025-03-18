
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Trash2, Printer } from 'lucide-react';

type InvoiceFormValues = {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  contractNumber: string;
  contractDate: string;
  services: Array<{
    description: string;
    quantity: string;
    unit: string;
    price: string;
    amount: string;
  }>;
};

const defaultService = { 
  description: '', 
  quantity: '1', 
  unit: 'шт', 
  price: '0', 
  amount: '0' 
};

const InvoiceCreation = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Array<{ id: string; number: string; date: string; customer: string; total: string }>>([
    { id: '1', number: '1022', date: '04.02.2025', customer: 'ТОВ "АГРОХІМТЕХНОЛОДЖІ"', total: '61 000,00' },
    { id: '2', number: '1023', date: '05.02.2025', customer: 'ТОВ "АГРОХІМТЕХНОЛОДЖІ"', total: '64 000,00' },
  ]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNumber: '1024',
      invoiceDate: new Date().toISOString().split('T')[0],
      customerName: 'ТОВ "АГРОХІМТЕХНОЛОДЖІ"',
      customerPhone: '(044) 300-04-03',
      contractNumber: 'Договір 0601/1 від 06.01.2023',
      contractDate: '06.01.2023',
      services: [{ ...defaultService }],
    },
  });

  const handleAddService = () => {
    const services = form.getValues().services || [];
    form.setValue('services', [...services, { ...defaultService }]);
  };

  const handleRemoveService = (index: number) => {
    const services = form.getValues().services;
    form.setValue('services', services.filter((_, i) => i !== index));
  };

  const calculateTotal = (services: InvoiceFormValues['services']) => {
    return services.reduce((total, service) => total + (parseFloat(service.amount) || 0), 0);
  };

  const onSubmit = (data: InvoiceFormValues) => {
    const totalAmount = calculateTotal(data.services).toFixed(2).replace('.', ',');
    
    toast({
      title: "Invoice created",
      description: `Invoice #${data.invoiceNumber} for ${data.customerName} has been created.`
    });
    
    setInvoices([
      ...invoices, 
      { 
        id: String(invoices.length + 1), 
        number: data.invoiceNumber, 
        date: data.invoiceDate, 
        customer: data.customerName,
        total: totalAmount + ' грн'
      }
    ]);
    
    // Reset form with new invoice number
    form.reset({
      ...data,
      invoiceNumber: String(parseInt(data.invoiceNumber) + 1),
      services: [{ ...defaultService }],
    });
  };
  
  const updateServiceAmount = (index: number) => {
    const services = form.getValues().services;
    const service = services[index];
    const quantity = parseFloat(service.quantity) || 0;
    const price = parseFloat(service.price) || 0;
    const amount = (quantity * price).toFixed(2);
    
    services[index].amount = amount;
    form.setValue('services', services);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice Creation</h1>
        <p className="text-muted-foreground">Create and manage invoices for your clients</p>
      </div>
      
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create New Invoice</TabsTrigger>
          <TabsTrigger value="manage">Manage Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                  <CardDescription>Enter the basic information for this invoice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contractNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contractDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Date</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Services & Products</CardTitle>
                      <CardDescription>Enter the services or products for this invoice</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddService}>
                      <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.watch('services').map((_, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label>Description</Label>
                          <Input
                            {...form.register(`services.${index}.description`)}
                            placeholder="Transport service"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Qty</Label>
                          <Input
                            {...form.register(`services.${index}.quantity`)}
                            type="number"
                            min="1"
                            onChange={(e) => {
                              form.setValue(`services.${index}.quantity`, e.target.value);
                              updateServiceAmount(index);
                            }}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Unit</Label>
                          <Input {...form.register(`services.${index}.unit`)} />
                        </div>
                        <div className="col-span-2">
                          <Label>Price</Label>
                          <Input
                            {...form.register(`services.${index}.price`)}
                            type="number"
                            min="0"
                            step="0.01"
                            onChange={(e) => {
                              form.setValue(`services.${index}.price`, e.target.value);
                              updateServiceAmount(index);
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Amount</Label>
                          <Input
                            {...form.register(`services.${index}.amount`)}
                            readOnly
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveService(index)}
                            disabled={form.watch('services').length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end border-t pt-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Amount:</div>
                        <div className="text-xl font-bold">
                          {calculateTotal(form.watch('services')).toFixed(2).replace('.', ',')} грн
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <FileText className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Invoice Preview</DialogTitle>
                      <DialogDescription>Preview how your invoice will look</DialogDescription>
                    </DialogHeader>
                    <div className="bg-white rounded-md p-6 space-y-4 border">
                      <div className="text-center font-bold text-lg mb-6">
                        Рахунок на оплату № {form.watch('invoiceNumber')} від {form.watch('invoiceDate')} р.
                      </div>
                      
                      <div className="space-y-2">
                        <div><strong>Постачальник:</strong> Фізична особа - підприємець ЄГОРОВ ДМИТРО ВОЛОДИМИРОВИЧ</div>
                        <div className="text-sm">
                          п/р UA673253650000000260030043249 у банку ПАТ "КРЕДОБАНК", м.Львів,
                          08135, Київська область, Бучанський район, с.Чайки, вул. ЛОБАНОВСЬКОГО ВАЛЕРІЯ, буд.10, кв.8,
                          тел.: +380674105077, divaegorov@gmail.com,
                          код за ДРФО 3049228154,
                          Платник єдиного податку 3 группа 5%
                        </div>
                      </div>
                      
                      <div>
                        <strong>Покупець:</strong> {form.watch('customerName')}
                      </div>
                      
                      <div>
                        <strong>Договір:</strong> {form.watch('contractNumber')}
                      </div>
                      
                      <table className="w-full border-collapse mt-4">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">№</th>
                            <th className="text-left p-2">Товари (роботи, послуги)</th>
                            <th className="text-center p-2">Кіл-сть</th>
                            <th className="text-center p-2">Од.</th>
                            <th className="text-right p-2">Ціна</th>
                            <th className="text-right p-2">Сума</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.watch('services').map((service, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">{service.description}</td>
                              <td className="text-center p-2">{service.quantity}</td>
                              <td className="text-center p-2">{service.unit}</td>
                              <td className="text-right p-2">{service.price}</td>
                              <td className="text-right p-2">{service.amount}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={5} className="text-right p-2 font-bold">Всього:</td>
                            <td className="text-right p-2 font-bold">
                              {calculateTotal(form.watch('services')).toFixed(2).replace('.', ',')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div>
                        Всього найменувань {form.watch('services').length}, на суму {calculateTotal(form.watch('services')).toFixed(2).replace('.', ',')} грн.
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button type="submit">
                  Create Invoice
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
              <CardDescription>Manage your existing invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Invoice #</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="p-3">{invoice.number}</td>
                        <td className="p-3">{invoice.date}</td>
                        <td className="p-3">{invoice.customer}</td>
                        <td className="p-3 text-right">{invoice.total}</td>
                        <td className="p-3 text-right space-x-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceCreation;
