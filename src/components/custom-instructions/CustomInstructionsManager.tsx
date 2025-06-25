
import React, { useEffect, useState } from "react";
import { CustomInstruction, customInstructionsService } from "@/services/db/customInstructionsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const CustomInstructionsManager: React.FC = () => {
  const [instructions, setInstructions] = useState<CustomInstruction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingInstruction, setEditingInstruction] = useState<CustomInstruction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CustomInstruction>>({
    name: "",
    instructionText: "",
    description: "",
    category: "general",
    isGlobal: false,
    isActive: true,
    priority: 0,
    appliesTo: []
  });

  const categories = [
    { id: "general", name: "General" },
    { id: "coding", name: "Coding" },
    { id: "writing", name: "Writing" },
    { id: "analysis", name: "Analysis" },
    { id: "creativity", name: "Creativity" },
    { id: "productivity", name: "Productivity" }
  ];

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      setIsLoading(true);
      const data = await customInstructionsService.getAllInstructions();
      setInstructions(data);
    } catch (error) {
      console.error("Failed to load custom instructions:", error);
      toast({
        title: "Error",
        description: "Failed to load custom instructions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstructions = instructions.filter(instruction => {
    const matchesCategory = selectedCategory === "all" || instruction.category === selectedCategory;
    return matchesCategory;
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.instructionText) {
        toast({
          title: "Error",
          description: "Name and instruction text are required",
          variant: "destructive",
        });
        return;
      }

      if (editingInstruction?.id) {
        await customInstructionsService.updateInstruction(editingInstruction.id, formData);
        toast({
          title: "Success",
          description: "Custom instruction updated",
        });
      } else {
        await customInstructionsService.createInstruction(formData as CustomInstruction);
        toast({
          title: "Success",
          description: "Custom instruction created",
        });
      }

      setIsDialogOpen(false);
      setEditingInstruction(null);
      setFormData({
        name: "",
        instructionText: "",
        description: "",
        category: "general",
        isGlobal: false,
        isActive: true,
        priority: 0,
        appliesTo: []
      });
      loadInstructions();
    } catch (error) {
      console.error("Failed to save instruction:", error);
      toast({
        title: "Error",
        description: "Failed to save instruction",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instruction: CustomInstruction) => {
    setEditingInstruction(instruction);
    setFormData(instruction);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await customInstructionsService.deleteInstruction(id);
      toast({
        title: "Success",
        description: "Custom instruction deleted",
      });
      loadInstructions();
    } catch (error) {
      console.error("Failed to delete instruction:", error);
      toast({
        title: "Error",
        description: "Failed to delete instruction",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await customInstructionsService.toggleActive(id);
      toast({
        title: "Success",
        description: "Instruction status updated",
      });
      loadInstructions();
    } catch (error) {
      console.error("Failed to toggle instruction:", error);
      toast({
        title: "Error",
        description: "Failed to update instruction status",
        variant: "destructive",
      });
    }
  };

  const handleNewInstruction = () => {
    setEditingInstruction(null);
    setFormData({
      name: "",
      instructionText: "",
      description: "",
      category: "general",
      isGlobal: false,
      isActive: true,
      priority: 0,
      appliesTo: []
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-ipa-primary" />
              <CardTitle>Custom Instructions</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewInstruction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instruction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingInstruction ? "Edit Custom Instruction" : "Create New Instruction"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter instruction name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of what this instruction does..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category || "general"}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (0-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.priority || 0}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instruction-text">Instruction Text</Label>
                    <Textarea
                      id="instruction-text"
                      value={formData.instructionText || ""}
                      onChange={(e) => setFormData({ ...formData, instructionText: e.target.value })}
                      placeholder="Enter the instruction text that will be sent to the AI..."
                      rows={8}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-global"
                      checked={formData.isGlobal || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                    />
                    <Label htmlFor="is-global">Apply to all prompts (Global)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={formData.isActive || true}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="is-active">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingInstruction ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Manage custom instructions that guide AI behavior and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredInstructions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {instructions.length === 0 ? "No instructions found. Create your first custom instruction!" : "No instructions match your filter criteria."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstructions.map((instruction) => (
                <Card key={instruction.id} className={`border-l-4 ${instruction.isActive ? 'border-l-green-500' : 'border-l-gray-400'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {instruction.name}
                          {instruction.isActive ? (
                            <Power className="h-4 w-4 text-green-500" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-gray-400" />
                          )}
                        </CardTitle>
                        {instruction.description && (
                          <CardDescription className="mt-1">
                            {instruction.description}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {categories.find(c => c.id === instruction.category)?.name || instruction.category}
                          </Badge>
                          {instruction.isGlobal && (
                            <Badge variant="outline">Global</Badge>
                          )}
                          <Badge variant="outline">Priority: {instruction.priority}</Badge>
                          <Badge variant={instruction.isActive ? "default" : "secondary"}>
                            {instruction.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => instruction.id && handleToggleActive(instruction.id)}
                        >
                          {instruction.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(instruction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => instruction.id && handleDelete(instruction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {instruction.instructionText.substring(0, 200)}...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomInstructionsManager;
