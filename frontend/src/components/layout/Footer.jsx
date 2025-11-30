import './Footer.css';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} Product Manager. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#" className="footer-link">Privacy</a>
                        <a href="#" className="footer-link">Terms</a>
                        <a href="#" className="footer-link">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
