"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Clipboard } from "lucide-react"
import { toast } from "sonner"
import { openDB } from "idb"

const initDB = async () => {
  return openDB("NotionLikeEditor", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("apiKey")) {
        db.createObjectStore("apiKey", { keyPath: "id" })
      }
    },
  })
}

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load API Key and show dialog if no key exists
  useEffect(() => {
    const getApiKey = async () => {
      try {
        const db = await initDB()
        const key = await db.get("apiKey", "current")
        if (key?.value) {
          setApiKey(key.value)
          setShowApiKey(true)
        } else {
          setIsDialogOpen(false)
        }
      } catch (error) {
        console.error("Error fetching API key from IndexedDB:", error)
        setIsDialogOpen(false) // Show dialog on error as well
      }
    }
    getApiKey()
  }, [])

  const handlePasteApiKey = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setApiKey(text)
    } catch (err) {
      console.error("Failed to read clipboard:", err)
    }
  }

  // Save API Key
  const saveApiKey = async (key : string) => {
    try {
      const db = await initDB()
      await db.put("apiKey", { id: "current", value: key })
      setApiKey(key)
      setShowApiKey(true)
      setIsDialogOpen(false)
      toast.success("API key added successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error saving API key:", error)
      toast.error("Failed to save API key")
    }
  }

  // Delete API Key
  const deleteApiKey = async () => {
    try {
      const db = await initDB()
      await db.delete("apiKey", "current")
      setApiKey("")
      setShowApiKey(false)
      toast.success("API key deleted successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Failed to delete API key")
    }
  }

  return (
    <div>
      {showApiKey ? (
        <div className="flex items-center gap-2">
          <span>API Key: ••••••••</span>
          <Button variant="outline" size="icon" onClick={() => setIsDialogOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={deleteApiKey}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter API Key</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 items-center">
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handlePasteApiKey}
                title="Paste from clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => saveApiKey(apiKey)}>Save</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}