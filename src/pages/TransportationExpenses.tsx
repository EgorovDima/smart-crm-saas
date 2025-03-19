import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, PlusCircle, Printer, Eye } from 'lucide-react';

interface ExpenseDocument {
  id: string;
  date: string;
  referenceNumber: string;
  vehicle: string;
  route: string;
  distance: number;
  amount: number;
  expeditionAmount: number;
  totalAmount: number;
}

const TransportationExpenses = () => {
  const [documentForm, setDocumentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    vehicle: '',
    route: '',
    distance: 0,
    amount: 0,
    expeditionAmount: 0,
    totalAmount: 0,
  });

  const [documents, setDocuments] = useState<ExpenseDocument[]>([
    {
      id: '1',
      date: '2025-02-04',
      referenceNumber: '80',
      vehicle: 'VOLVO ВО2181ВН/ВО2017ХF',
      route: 'Болгарія м. Девня - м/п Порубне - Тернопільська область м. Кременець',
      distance: 940,
      amount: 60000,
      expeditionAmount: 1000,
      totalAmount: 61000,
    }
  ]);

  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ExpenseDocument | null>(null);
  const { toast } = useToast();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDocumentForm({ ...documentForm, [name]: value });
    
    // Auto-calculate the total amount when amount or expeditionAmount changes
    if (name === 'amount' || name === 'expeditionAmount') {
      const amount = name === 'amount' ? parseFloat(value) : documentForm.amount;
      const expeditionAmount = name === 'expeditionAmount' ? parseFloat(value) : documentForm.expeditionAmount;
      
      setDocumentForm(prev => ({
        ...prev,
        totalAmount: amount + expeditionAmount
      }));
    }
  };

  const handleCreateDocument = () => {
    const newDocument: ExpenseDocument = {
      id: Date.now().toString(),
      date: documentForm.date,
      referenceNumber: documentForm.referenceNumber,
      vehicle: documentForm.vehicle,
      route: documentForm.route,
      distance: parseFloat(documentForm.distance.toString()),
      amount: parseFloat(documentForm.amount.toString()),
      expeditionAmount: parseFloat(documentForm.expeditionAmount.toString()),
      totalAmount: parseFloat(documentForm.totalAmount.toString()),
    };

    setDocuments([...documents, newDocument]);
    
    toast({
      title: "Документ створено",
      description: `Довідка про транспортно-експедиційні витрати №${documentForm.referenceNumber} створена успішно.`
    });

    // Reset form but keep the date
    setDocumentForm({
      date: documentForm.date,
      referenceNumber: '',
      vehicle: '',
      route: '',
      distance: 0,
      amount: 0,
      expeditionAmount: 0,
      totalAmount: 0,
    });
  };

  const handlePreviewDocument = (document: ExpenseDocument) => {
    setSelectedDocument(document);
    setIsPreviewActive(true);
  };

  const handleGenerateDocument = (document: ExpenseDocument) => {
    // Simulate document generation
    toast({
      title: "Документ згенеровано",
      description: `Довідка про транспортно-експедиційні витрати №${document.referenceNumber} згенерована успішно.`
    });

    // In a real implementation, this would trigger the document download
    setTimeout(() => {
      toast({
        title: "Готово",
        description: "Документ готовий для завантаження.",
      });
    }, 1000);
  };

  // Helper function to convert numbers to Ukrainian text format
  const numberToUkrainianText = (number: number) => {
    // This is a simplified version - in a real app would be more complex
    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;
    
    let text = '';
    if (thousands > 0) {
      text += thousands === 1 ? 'Одна тисяча ' : `${thousands} тисяч `;
    }
    
    if (remainder > 0 || number === 0) {
      text += remainder.toString();
    }
    
    return text + ' гривень, 00 копійок';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Транспортні витрати</h1>
          <p className="text-lg text-muted-foreground">
            Створення та управління довідками про транспортно-експедиційні витрати
          </p>
        </div>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Створити довідку</TabsTrigger>
          <TabsTrigger value="list">Список довідок</TabsTrigger>
          {isPreviewActive && <TabsTrigger value="preview">Перегляд довідки</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Нова довідка про транспортно-експедиційні витрати</CardTitle>
              <CardDescription>
                Заповніть форму для створення нової довідки про транспортні витрати.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Дата</Label>
                  <Input 
                    id="date"
                    name="date"
                    type="date"
                    value={documentForm.date}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Вихідний номер</Label>
                  <Input 
                    id="referenceNumber"
                    name="referenceNumber"
                    placeholder="Наприклад: 80"
                    value={documentForm.referenceNumber}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vehicle">Транспортний засіб</Label>
                  <Input 
                    id="vehicle"
                    name="vehicle"
                    placeholder="Наприклад: VOLVO ВО2181ВН/ВО2017ХF"
                    value={documentForm.vehicle}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="route">Маршрут</Label>
                  <Input 
                    id="route"
                    name="route"
                    placeholder="Наприклад: Болгарія м. Девня - м/п Порубне - Тернопільська область м. Кременець"
                    value={documentForm.route}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Відстань (км)</Label>
                  <Input 
                    id="distance"
                    name="distance"
                    type="number"
                    placeholder="Наприклад: 940"
                    value={documentForm.distance}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Вартість перевезення (грн)</Label>
                  <Input 
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Наприклад: 60000"
                    value={documentForm.amount}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expeditionAmount">Вартість експедиційних послуг (грн)</Label>
                  <Input 
                    id="expeditionAmount"
                    name="expeditionAmount"
                    type="number"
                    placeholder="Наприклад: 1000"
                    value={documentForm.expeditionAmount}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Загальна вартість (грн)</Label>
                  <Input 
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    readOnly
                    value={documentForm.totalAmount}
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleCreateDocument} disabled={!documentForm.referenceNumber || !documentForm.vehicle || !documentForm.route}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Створити довідку
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Список довідок</CardTitle>
              <CardDescription>
                Управління існуючими довідками про транспортно-експедиційні витрати.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium">№</th>
                        <th className="px-4 py-2 text-left font-medium">Дата</th>
                        <th className="px-4 py-2 text-left font-medium">Маршрут</th>
                        <th className="px-4 py-2 text-left font-medium">Сума (грн)</th>
                        <th className="px-4 py-2 text-right font-medium">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={doc.id} className="border-b">
                          <td className="px-4 py-2">{doc.referenceNumber}</td>
                          <td className="px-4 py-2">
                            {new Date(doc.date).toLocaleDateString('uk-UA')}
                          </td>
                          <td className="px-4 py-2">{doc.route}</td>
                          <td className="px-4 py-2">{doc.totalAmount.toLocaleString()} грн</td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePreviewDocument(doc)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> Перегляд
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateDocument(doc)}
                            >
                              <Download className="h-4 w-4 mr-1" /> Word
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-2 opacity-30" />
                  <p>Немає збережених довідок</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isPreviewActive && selectedDocument && (
          <TabsContent value="preview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Перегляд довідки</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateDocument(selectedDocument)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Word
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Printer className="h-4 w-4 mr-1" /> Друк
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 font-serif text-lg shadow-sm border rounded-md">
                  <div className="flex justify-between mb-8">
                    <p>Вих. № {selectedDocument.referenceNumber} від {new Date(selectedDocument.date).toLocaleDateString('uk-UA')}</p>
                    <p className="text-right">Для пред'явлення в митні органи</p>
                  </div>
                  
                  <h2 className="text-xl font-bold text-center mb-6">Довідка про транспортно-експедиційні витрати по перевезенню вантажу</h2>
                  
                  <p className="mb-4">
                    Доводимо до Вашого відома, що ціна транспортно-експедиційних витрат по перевезенню та завантаженню вантажу автомобілем {selectedDocument.vehicle}.
                  </p>
                  
                  <p className="mb-4">
                    Транспортні послуги за маршрутом {selectedDocument.route} відстань {selectedDocument.distance} кілометрів - {selectedDocument.amount.toLocaleString()} грн ({numberToUkrainianText(selectedDocument.amount)}).
                  </p>
                  
                  <p className="mb-4">
                    Експедиційні послуги складають {selectedDocument.expeditionAmount.toLocaleString()} грн. ({numberToUkrainianText(selectedDocument.expeditionAmount)}).
                  </p>
                  
                  <p className="mb-4">
                    Загальна вартість транспортних витрат {selectedDocument.totalAmount.toLocaleString()} грн ({numberToUkrainianText(selectedDocument.totalAmount)}). Вантаж не страхувався. Витрати на завантаження/розвантаження включено.
                  </p>
                  
                  <div className="mt-12">
                    <p>Директор _______________  Єгоров Д.В.</p>
                    <p className="mt-4">Головний бухгалтер штатним розписом не передбачений</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TransportationExpenses;
