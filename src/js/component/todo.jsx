import React, { useState } from "react";

const Todo = () => {
    const [user, setUser] = useState(""); 
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const URL = "https://playground.4geeks.com/todo/";
    const [message, setMessage] = useState("");
    const [info, setInfo] = useState("Bienvenido. Por favor, ingrese su nombre de usuario para inciar sesion o crear un nuevo usuario.");
    const [isLoading, setIsLoading] = useState(false);


    async function agregarTarea(e) {
        console.log("agregarTarea");
        if (e.key === "Enter" && inputValue != null && inputValue.valueOf() != "") {
            const result = await query(`todos/${user}`, 'POST', {"label": inputValue,"is_done": false});
            if (result) {
                setTodos([...todos, result]);
            }
            else {
                setMessage("Failed to create task. Please try again.");
            }
            setInputValue("");
        }
    };

    const query = async (type, method, body) =>{
        
        let reqParams = {};
        if (body) {
            reqParams = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
                }
            console.log(JSON.stringify(body))
        }
        else {
            reqParams = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
        try {
            console.log("query: ", URL+type, reqParams);
            const response = await fetch(URL+type, reqParams)
            console.log(response);
            if (response.ok && response.status === 200 || response.status === 201) {
                console.log("query success");
                const data = await response.json();
                console.log(data);
                return data;
            }
            else if (response.ok && response.status === 204){
                console.log("query success without response");
            } 
            else { 
                new Error("Failed to fetch data");
                return false
            }
        }
        catch (error) {
            console.log(error.message);
        }
        
    }

    const signUp = async () => {
        console.log("signUp");
        setIsLoading(true);
        const result = await query(`users/${inputValue}`, 'POST', null);
        if (result) {
            setUser(result.name);
            setIsLoading(false);
            setInfo(`Bienvenido ${result.name}, por favor, ingrese una tarea.`);
        }
        else {
            setMessage("Failed to create user. Please try again.");
        }
        setInputValue("");
    }
    
    const login = async (e) => {
        console.log("login");
        if (e.key === "Enter" && inputValue != null && inputValue.valueOf() != "") {
            setIsLoading(true);

            const result = await query(`users/${inputValue}`, 'GET', null);
            if (result) {
                setUser(result.name)
                setTodos(result.todos)
                setIsLoading(false);
                setInfo(`Bienvenido ${result.name}, Por favor, ingresa una tarea.`);
            }
            else {
                if (window.confirm("User not found. Do you want to create a new user?")) {
                    signUp();
                }
                else {
                    setMessage("User not found. Please try again.");
                }
            }
            setInputValue("");
        }
    };

    async function handleRemoveClick(taskID){
        console.log("handleRemoveClick");
        setIsLoading(true);
        const result = await query(`todos/${taskID}`, 'DELETE', null);
        if (result) {
            setTodos(todos.filter((task) => task.id !== taskID));
            setIsLoading(false);
        }
        else {
            setIsLoading(false);
            setMessage("Failed to delete task. Please try again.");
        }
    };

    const taskDone = async (taskID) => {
        console.log("taskDone");
        setIsLoading(true);
        const result = await query(`todos/${taskID}`, 'PUT', {"is_done": true});
        if (result) {
            setTodos(todos.map((task) => {
                if (task.id === taskID) {
                    task.is_done = true;
                }
                return task;
            }));
            setIsLoading(false);
        }
        else {
            setIsLoading(false);
            setMessage("Failed to mark task as done. Please try again.");
        }
    };

    function content (todos){
        return (
            <ul className="list-group list-group-flush">
            {todos.map((task, index) => (
                <li
                className="list-group-item d-flex justify-content-between"
                key={index}
                >
                    <h6>{task.label}</h6>
                    <div>
                        {task.is_done ? <span className="badge bg-success">Done</span> :
                            <button
                            className="btn btn-success"
                            onClick={() => taskDone(task.id)}
                            >Done
                            </button>
                        }
                        

                        <button
                        className="btn-close"
                        onClick={() => handleRemoveClick(task.id)}
                        >
                        </button>
                    </div>
                </li>
            ))}
            </ul>
        )
    }
    <div className="d-flex align-items-center">
        <strong role="status">Loading...</strong>
        <div className="spinner-border ms-auto" aria-hidden="true"></div>
    </div>

    return(
        <div className="container-fluid">
            <div className="container d-flex flex-column align-items-center">
                <div className="header text-center">
                    <h1 className="title mt-2">ToDos</h1>
                    <h6 className="wellcome-message mt-5">{info}</h6>
                </div>
                <div className="card">
                    <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === "Enter") {
                            if (user !== "") {
                                agregarTarea(e)
                            }
                            else {
                                login(e)
                            }
                        }
                        }}
                    />
                    {isLoading ? 
                    (
                    <div className="d-flex align-items-center">
                        <strong role="status">Loading...</strong>
                        <div className="spinner-border ms-auto" aria-hidden="true"></div>
                    </div>
                    ): user != "" && todos.length > 0 ?
                        content(todos)
                        : ""}
                    {message != "" ?
                    (
                        <div className="alert alert-danger" role="alert">
                            {message}
                        </div>
                    ): ""
                }
                </div>
            </div>
        </div>
    );
};

export default Todo;