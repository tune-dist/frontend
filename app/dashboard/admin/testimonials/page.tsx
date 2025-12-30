'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Trash2, Loader2, Plus, Edit, Save } from 'lucide-react';
import { testimonialsApi, Testimonial } from '@/lib/api/testimonials';
import toast from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_URL } from '@/lib/config';

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog & Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({});

    const fetchTestimonials = async () => {
        try {
            setIsLoading(true);
            const data = await testimonialsApi.getAll();
            setTestimonials(data);
        } catch (error) {
            toast.error('Failed to load testimonials');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await testimonialsApi.remove(id);
            toast.success('Testimonial deleted successfully');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to delete testimonial');
        }
    };

    const handleOpenCreate = () => {
        setCurrentTestimonial({});
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (testimonial: Testimonial) => {
        setCurrentTestimonial({ ...testimonial });
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const response = await testimonialsApi.uploadImage(file);
            setCurrentTestimonial({ ...currentTestimonial, image: response.path });
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            if (currentTestimonial._id) {
                await testimonialsApi.update(currentTestimonial._id, currentTestimonial);
                toast.success('Testimonial updated successfully');
            } else {
                await testimonialsApi.create(currentTestimonial);
                toast.success('Testimonial created successfully');
            }
            setIsDialogOpen(false);
            fetchTestimonials();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save testimonial');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
                        <p className="text-muted-foreground">
                            Manage testimonials displayed on the landing page.
                        </p>
                    </div>
                    <Button onClick={handleOpenCreate} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="h-4 w-4" />
                        Add Testimonial
                    </Button>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Quote className="h-5 w-5" />
                            All Testimonials
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : testimonials.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No testimonials found.</p>
                            </div>
                        ) : (
                            <div className="rounded-md border border-border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Quote</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {testimonials.map((testimonial) => (
                                            <TableRow key={testimonial._id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {testimonial.image && (
                                                            <img
                                                                src={`${API_URL}${testimonial.image}`}
                                                                alt={testimonial.name}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        )}
                                                        {testimonial.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{testimonial.role}</TableCell>
                                                <TableCell className="max-w-md truncate">"{testimonial.quote}"</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(testimonial)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                            onClick={() => handleDelete(testimonial._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {currentTestimonial._id ? 'Edit Testimonial' : 'Add Testimonial'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={currentTestimonial.name || ''}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    value={currentTestimonial.role || ''}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                                    placeholder="Music Producer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Author Image</Label>
                                <div className="flex flex-col gap-4">
                                    {currentTestimonial.image && (
                                        <div className="relative h-20 w-20 rounded-full overflow-hidden border border-border">
                                            <img
                                                src={`${API_URL}${currentTestimonial.image}`}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="cursor-pointer"
                                        />
                                        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: Square image (1:1), at least 200x200px.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quote">Quote</Label>
                                <textarea
                                    id="quote"
                                    value={currentTestimonial.quote || ''}
                                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, quote: e.target.value })}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="KratoLib changed my life..."
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="nr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
