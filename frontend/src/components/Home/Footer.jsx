
const Footer = () =>{
    const email = "info@collabdesign.com";
    const year = new Date().getFullYear();
    return (
        <footer className="bg-[#333333] text-white py-4 text-center mt-5">
            <div className="text-sm">
                &copy; {year} Collab Design. All rights reserved.
            </div>
            <div className="text-sm mt-1">
                Contact: <a href={`mailto:${email}`} className="text-blue-400 hover:underline">{email}</a>
            </div>
        </footer>
    );
}

export default Footer;