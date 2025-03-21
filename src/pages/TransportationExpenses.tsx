
import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download, PlusCircle, Printer, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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
    let parsedValue: string | number = value;
    
    if (name === 'distance' || name === 'amount' || name === 'expeditionAmount') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setDocumentForm(prevForm => {
      const updatedForm = { ...prevForm, [name]: parsedValue };
      
      if (name === 'amount' || name === 'expeditionAmount') {
        const amount = name === 'amount' ? 
          (parsedValue as number) : prevForm.amount;
        const expeditionAmount = name === 'expeditionAmount' ? 
          (parsedValue as number) : prevForm.expeditionAmount;
        
        updatedForm.totalAmount = amount + expeditionAmount;
      }
      
      return updatedForm;
    });
  };

  const isFormValid = () => {
    return (
      documentForm.referenceNumber.trim() !== '' && 
      documentForm.vehicle.trim() !== '' && 
      documentForm.route.trim() !== ''
    );
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Помилка валідації",
        description: "Будь ласка, заповніть всі обов'язкові поля.",
        variant: "destructive"
      });
      return;
    }

    const newDocument: ExpenseDocument = {
      id: Date.now().toString(),
      date: documentForm.date,
      referenceNumber: documentForm.referenceNumber,
      vehicle: documentForm.vehicle,
      route: documentForm.route,
      distance: Number(documentForm.distance),
      amount: Number(documentForm.amount),
      expeditionAmount: Number(documentForm.expeditionAmount),
      totalAmount: Number(documentForm.totalAmount),
    };

    setDocuments(prev => [...prev, newDocument]);
    
    toast({
      title: "Документ створено",
      description: `Довідка про транспортно-експедиційні витрати №${documentForm.referenceNumber} створена успішно.`
    });

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
    toast({
      title: "Документ згенеровано",
      description: `Довідка про транспортно-експедиційні витрати №${document.referenceNumber} згенерована успішно.`
    });

    setTimeout(() => {
      toast({
        title: "Готово",
        description: "Документ готовий для завантаження.",
      });
    }, 1000);
  };

  const numberToUkrainianText = (number: number) => {
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
              <form className="space-y-4" onSubmit={handleCreateDocument}>
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
                      required
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
                      required
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Відстань (км)</Label>
                    <Input 
                      id="distance"
                      name="distance"
                      type="number"
                      placeholder="Наприклад: 940"
                      value={documentForm.distance === 0 ? '' : documentForm.distance}
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
                      value={documentForm.amount === 0 ? '' : documentForm.amount}
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
                      value={documentForm.expeditionAmount === 0 ? '' : documentForm.expeditionAmount}
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
                      value={documentForm.totalAmount === 0 ? '' : documentForm.totalAmount}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    type="submit"
                    disabled={!isFormValid()}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Створити довідку
                  </Button>
                </div>
              </form>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Маршрут</TableHead>
                      <TableHead>Сума (грн)</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.referenceNumber}</TableCell>
                        <TableCell>
                          {new Date(doc.date).toLocaleDateString('uk-UA')}
                        </TableCell>
                        <TableCell>{doc.route}</TableCell>
                        <TableCell>{doc.totalAmount.toLocaleString()} грн</TableCell>
                        <TableCell className="text-right space-x-2">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
