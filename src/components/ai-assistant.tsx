'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, User, Sparkles } from 'lucide-react';
import { getTravelAssistantResponse } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

const AiAssistant = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: query, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            const response = await getTravelAssistantResponse(query);
            const aiMessage: Message = { id: Date.now() + 1, text: response.answer, sender: 'ai' };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Assistant Error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-[70vh] flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Sparkles className="text-accent" />
                    AI Travel Agent Assistant
                </CardTitle>
                <CardDescription>Ask travel questions and get instant, accurate answers.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex items-start gap-4',
                                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.sender === 'ai' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles size={18}/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'max-w-md rounded-lg p-3 text-base',
                                        message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    )}
                                >
                                    {message.text}
                                </div>
                                {message.sender === 'user' && (
                                     <Avatar className="w-8 h-8">
                                        <AvatarFallback><User size={18}/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-4 justify-start">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-accent text-accent-foreground"><Sparkles size={18}/></AvatarFallback>
                                </Avatar>
                                <div className="max-w-md rounded-lg p-3 bg-muted space-y-2">
                                   <Skeleton className="h-4 w-[250px]" />
                                   <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 pt-4 border-t">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., How many points for Orlando in July as Gold?"
                        className="flex-1 text-base"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !query.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default AiAssistant;
