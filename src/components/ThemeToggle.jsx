import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "../contexts/ThemeContext";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <style>{`
                .theme-toggle {
                    width: 62px;
                    height: 32px;
                    padding: 3px;
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    background: var(--bg-hover-row);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .theme-toggle-knob {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,.25);
                    transition: transform .25s ease;
                }

                .theme-toggle.dark .theme-toggle-knob {
                    transform: translateX(30px);
                }

                .theme-toggle-icon {
                    font-size: 16px;
                    color: var(--text-primary);
                }

                .theme-toggle:hover {
                    border-color: var(--border-strong);
                }
            `}</style>

            <button
                className={`theme-toggle ${theme}`}
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                <span className="theme-toggle-knob">
                    {theme === "light" ? (
                        <MdLightMode className="theme-toggle-icon" />
                    ) : (
                        <MdDarkMode className="theme-toggle-icon" />
                    )}
                </span>
            </button>
        </>
    );
}

export default ThemeToggle;