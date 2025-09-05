import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Brain, ArrowLeft, Plus, Edit, Trash2, Save, Search } from 'lucide-react';

// Types (aligned with event-manage.tsx Question)
interface Question {
  id: string;
  eventId: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  points: number;
  timeLimit: number;
  orderIndex: number;
  aiGenerated?: boolean;
  explanation?: string;
  backgroundImageUrl?: string | null;
}

interface TriviaManageProps { eventId?: string; }

// Full page edit form component
const FullQuestionEditor: React.FC<{ question: Question; onClose: () => void; onSave: (q: Question) => void; saving: boolean; }> = ({ question, onClose, onSave, saving }) => {
  type UnsplashImage = {
    id: string;
    description?: string;
    alt_description?: string;
    urls: { thumb: string; small: string; regular: string; full: string };
    links: { html: string; download_location?: string };
    user: { name: string; links: { html: string } };
  };
  const [form, setForm] = useState({
    question: question.question,
    correctAnswer: question.correctAnswer,
    options: [...(question.options || [])],
    difficulty: question.difficulty || 'medium',
    category: question.category || '',
    points: question.points || 100,
    timeLimit: question.timeLimit || 30,
    orderIndex: question.orderIndex || 1,
    explanation: question.explanation || '',
    backgroundImageUrl: question.backgroundImageUrl || ''
  });
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashImage[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true); setUnsplashError(null);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(unsplashQuery)}&perPage=20`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch (e: any) { setUnsplashError(e.message); }
    finally { setUnsplashLoading(false); }
  };

  const trackDownload = async (img: UnsplashImage) => {
    if (!img.links.download_location) return;
    fetch('/api/unsplash/track-download', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadUrl: img.links.download_location })
    }).catch(()=>{});
  };

  const save = () => {
    const updated: Question = {
      ...question,
      question: form.question,
      correctAnswer: form.correctAnswer,
      options: form.options,
      difficulty: form.difficulty,
      category: form.category,
      points: form.points,
      timeLimit: form.timeLimit,
      orderIndex: form.orderIndex,
      explanation: form.explanation,
      backgroundImageUrl: form.backgroundImageUrl || null
    };
    if (selectedImage) trackDownload(selectedImage);
    onSave(updated);
  };

  const updateOption = (i: number, v: string) => {
    const opts = [...form.options]; opts[i] = v; setForm({ ...form, options: opts });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6" /> Edit Question</h1>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline">Back</Button>
          <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Label>Question</Label>
            <Textarea value={form.question} rows={4} onChange={e=>setForm({...form, question:e.target.value})} />
          </div>
          {question.type === 'multiple_choice' && (
            <div>
              <Label>Options</Label>
              <div className="mt-2 space-y-2">
                {form.options.map((o,i)=>(
                  <div key={i} className="flex gap-2">
                    <span className="w-8 h-10 rounded bg-gray-100 flex items-center justify-center text-sm font-semibold">{String.fromCharCode(65+i)}</span>
                    <Input value={o} onChange={e=>updateOption(i,e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Correct Answer</Label>
              <Input value={form.correctAnswer} onChange={e=>setForm({...form, correctAnswer:e.target.value})} />
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" value={form.points} onChange={e=>setForm({...form, points: parseInt(e.target.value)||0})} />
            </div>
            <div>
              <Label>Time Limit (s)</Label>
              <Input type="number" value={form.timeLimit} onChange={e=>setForm({...form, timeLimit: parseInt(e.target.value)||30})} />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v=>setForm({...form, difficulty:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
            </div>
            <div>
              <Label>Order #</Label>
              <Input type="number" value={form.orderIndex} onChange={e=>setForm({...form, orderIndex: parseInt(e.target.value)||1})} />
            </div>
          </div>
          <div>
            <Label>Explanation</Label>
            <Textarea rows={3} value={form.explanation} onChange={e=>setForm({...form, explanation:e.target.value})} />
          </div>
        </div>
        {/* Side panel for Unsplash image and metadata */}
        <div className="space-y-6">
          <div>
            <Label>Background Image</Label>
            {form.backgroundImageUrl ? (
              <div className="mt-2 space-y-2">
                <img src={form.backgroundImageUrl} alt="Selected background" className="w-full h-48 object-cover rounded border" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setForm({ ...form, backgroundImageUrl: '' });
                    setSelectedImage(null);
                  }}
                >Remove</Button>
              </div>
            ) : <p className="text-sm text-gray-500 mt-1">No image selected.</p>}
          </div>
          <div className="border rounded p-4 space-y-3 bg-gray-50">
            <div className="flex gap-2">
              <Input placeholder="Search Unsplash" value={unsplashQuery} onChange={e=>setUnsplashQuery(e.target.value)} />
              <Button onClick={searchUnsplash} disabled={unsplashLoading}><Search className="h-4 w-4" /></Button>
            </div>
            {unsplashError && <p className="text-sm text-red-600">{unsplashError}</p>}
            {unsplashResults.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {unsplashResults.map(img=> (
                  <button key={img.id} type="button" onClick={()=>{setSelectedImage(img); setForm({...form, backgroundImageUrl: img.urls.regular});}} className={`relative border rounded overflow-hidden ${selectedImage?.id===img.id ? 'ring-2 ring-wine-500':'hover:ring-2 hover:ring-wine-300'}`}>
                    <img src={img.urls.thumb} alt={img.alt_description||'img'} className="w-full h-20 object-cover" />
                    {selectedImage?.id===img.id && <span className="absolute inset-0 bg-wine-600/40 flex items-center justify-center text-white text-xs font-semibold">Selected</span>}
                  </button>
                ))}
              </div>
            )}
            {selectedImage && (
              <p className="text-[11px] text-gray-600">Photo by <a className="underline" target="_blank" rel="noreferrer" href={`${selectedImage.user.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>{selectedImage.user.name}</a> on <a className="underline" target="_blank" rel="noreferrer" href={`${selectedImage.links.html}?utm_source=TriviaSpark&utm_medium=referral`}>Unsplash</a></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventTriviaManage: React.FC<TriviaManageProps> = ({ eventId: propEventId }) => {
  const [, params] = useRoute('/events/:id/manage/trivia');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const eventId = propEventId || params?.id;
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Fetch all questions
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/events', eventId, 'questions'],
    enabled: !!eventId
  });

  // Update mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (question: Question) => {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'questions'] });
      toast({ title: 'Saved', description: 'Question updated.' });
      setEditingQuestion(null);
    },
    onError: (e:any) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
  });

  // Delete mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'questions'] });
      toast({ title: 'Deleted', description: 'Question removed.' });
    },
    onError: (e:any) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
  });

  if (!eventId) return <div className="p-8 text-center">Invalid event.</div>;

  if (isLoading) return <div className="p-8 text-center">Loading questions...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={()=>setLocation(`/events/${eventId}/manage`)} className="text-wine-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
            </Button>
            <h1 className="text-2xl font-bold text-wine-800 flex items-center gap-2"><Brain className="h-6 w-6" /> Trivia Questions</h1>
          </div>
          <Badge variant="outline">{questions.length} Questions</Badge>
        </div>

        <Card className="trivia-card">
          <CardHeader>
            <CardTitle className="wine-text">All Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                No questions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.sort((a,b)=>a.orderIndex-b.orderIndex).map((q,idx)=>(
                  <div key={q.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex flex-wrap gap-2 mb-2 items-center">
                        <Badge variant="secondary">#{q.orderIndex || idx+1}</Badge>
                        <Badge variant="outline">{q.type.replace('_',' ')}</Badge>
                        <Badge variant="outline">{q.points} pts</Badge>
                        <Badge variant="outline">{q.timeLimit}s</Badge>
                        {q.aiGenerated && <Badge variant="outline" className="bg-blue-50 text-blue-600">AI</Badge>}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{q.question}</h3>
                      {q.options?.length>0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {q.options.map((o,i)=>(
                            <div key={i} className={`text-xs p-2 rounded ${o===q.correctAnswer ? 'bg-green-100 text-green-800 font-medium':'bg-gray-100 text-gray-700'}`}>{String.fromCharCode(65+i)}. {o}</div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-green-600 font-medium mb-1">Correct: {q.correctAnswer}</p>
                      {q.explanation && <p className="text-xs text-gray-500 line-clamp-2">{q.explanation}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={()=>setEditingQuestion(q)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={()=>{ if(confirm('Delete this question?')) deleteQuestionMutation.mutate(q.id); }}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {editingQuestion && (
          <div className="fixed inset-0 z-30 bg-white overflow-y-auto px-6 py-10">
            <FullQuestionEditor
              question={editingQuestion}
              saving={updateQuestionMutation.isPending}
              onClose={()=>setEditingQuestion(null)}
              onSave={(q)=>updateQuestionMutation.mutate(q)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTriviaManage;
