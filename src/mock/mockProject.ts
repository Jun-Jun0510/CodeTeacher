import type { FileNode } from "@/types/fileTree";

export const mockFileTree: FileNode[] = [
  {
    name: "todo_app",
    path: "todo_app",
    type: "directory",
    children: [
      {
        name: "main.py",
        path: "todo_app/main.py",
        type: "file",
        language: "python",
      },
      {
        name: "models.py",
        path: "todo_app/models.py",
        type: "file",
        language: "python",
      },
      {
        name: "database.py",
        path: "todo_app/database.py",
        type: "file",
        language: "python",
      },
      {
        name: "routes",
        path: "todo_app/routes",
        type: "directory",
        children: [
          {
            name: "__init__.py",
            path: "todo_app/routes/__init__.py",
            type: "file",
            language: "python",
          },
          {
            name: "todos.py",
            path: "todo_app/routes/todos.py",
            type: "file",
            language: "python",
          },
        ],
      },
      {
        name: "requirements.txt",
        path: "todo_app/requirements.txt",
        type: "file",
        language: "text",
      },
    ],
  },
];

export const mockFileContents: Record<string, string> = {
  "todo_app/main.py": `from fastapi import FastAPI
from routes import todos

app = FastAPI()
app.include_router(todos.router, prefix="/todos")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,

  "todo_app/models.py": `from pydantic import BaseModel
from typing import Optional

class TodoItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None`,

  "todo_app/database.py": `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("sqlite:///todos.db")
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,

  "todo_app/routes/__init__.py": `# routes package`,

  "todo_app/routes/todos.py": `from fastapi import APIRouter, HTTPException, Depends
from models import TodoItem
from database import get_db

router = APIRouter()
todos_db: list[TodoItem] = []

@router.get("/")
async def list_todos(db=Depends(get_db)):
    return db.query(TodoItem).all()

@router.post("/")
async def create_todo(todo: TodoItem, db=Depends(get_db)):
    db.add(todo)
    db.commit()
    return todo

@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, db=Depends(get_db)):
    todo = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Deleted"}`,

  "todo_app/requirements.txt": `fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0`,
};
