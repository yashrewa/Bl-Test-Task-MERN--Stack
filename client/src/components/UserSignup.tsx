import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { expressBackend } from "./Utils/backendLink";

function UserSingup() {
    const navigate = useNavigate()
    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [phone_number, setPhone_number] = useState<string>("");
    // const [token, setToken] = useState("");

    const Signup = async () => {
        try {
            const response: AxiosResponse = await axios.post(`${expressBackend}/signup`, {
                name: name,
                email: email,
                phone_number: phone_number,
                password: password,

            }, { headers: { 'Content-Type': 'application/json' } });
            console.log(response)
            if (response.data.message.issues) {
                response.data.message.issues.forEach((issue:{path:string; code:string}) => {
                    return window.alert(`${issue.path[0]
                        } ${issue.code
                        }`);
                })
            }
            if (response.data.token) {
                navigate('/')
                sessionStorage.setItem("token", response.data.token);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="h-screen">
            <div className="text-center text-2xl md:text-4xl font-medium pt-6 font-Inter">Welcome To Taste Of <span className="text-green-500">TRIBUTE</span></div>
            <div className="text-center text-xl font-medium pt-6 font-Inter">Singup</div>
            <div className="my-16 flex justify-center">
                <div className="w-4/6 lg:w-4/12 shadow-lg px-10 pt-10 pb-4 btn-neomorph rounded-xl text-center">
                    <div className="mb-3 pt-0">
                        <input type="text" placeholder="name"
                            onChange={
                                (e) => setName(e.target.value)
                            }
                            className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
                    </div>
                    <div className="mb-3 pt-0">
                        <input type="text" placeholder="email"
                            onChange={
                                (e) => setEmail(e.target.value)
                            }
                            className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
                    </div>
                    <div className="mb-3 pt-0">
                        <input type="text" placeholder="phone number"
                            onChange={
                                (e) => setPhone_number(e.target.value)
                            }
                            maxLength={10}
                            className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
                    </div>
                    <div className="mb-3 pt-0">
                        <input type="password" placeholder="Password"
                            onChange={
                                (e) => setPassword(e.target.value)
                            }
                            className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
                    </div>
                    <div className="flex justify-between items-center mt-3 mb-2">
                        <button type="button"
                            onClick={
                                () => Signup()
                            }
                            className={`btn btn-primary `}
                        >
                            Signup
                        </button>
                        <div className="text-sm text-left pl-4 text-gray-600">
                            Already have an account?
                            <br />
                            <span className="font-Poppins font-semibold text- underline">
                                <Link to='/'>Login</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserSingup;
