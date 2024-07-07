import { useState } from "react";
import "./login.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import { auth,db } from "../../lib/firebase"; // Adjust the import path based on your project structure
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });

    const [loading,setLoading] = useState(false)

    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleRegister = async e => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);

        const { username, email, password } = Object.fromEntries(formData);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const imgUrl= await upload(avatar.file)

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar:imgUrl,
                id:res.user.uid,
                blocked:[],
              });

              await setDoc(doc(db, "userchat", res.user.uid), {
              chats:[],
              });

              toast.success("Account created! You can login now!");
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
        finally{
          setLoading(false);
        }
    };

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const {email, password } = Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth,email,password);
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <div className='login'>
            <ToastContainer position="bottom-right" />
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading?"Loading" :"Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file" className="upload-label">
                        <img src={avatar.url || "./avatar.png"} alt="avatar" />
                        Upload an Image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading?"Loading" :"SignUp"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
