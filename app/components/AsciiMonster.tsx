type Props = { variant?: "boss" | "small" | "warning"; className?: string };

const art = {
  boss: `      .--.  .--.
     :   \\__/   :
      \\  6  6  /
       \\   '  /
        \\ -- /
       /|    |\\`,
  small: `  .-.
 (o o)
 | O |
  '-'`,
  warning: `   .-""-.
  / >  < \\
 |   ^    |
  \\  --  /`,
};

export function AsciiMonster({ variant = "boss", className = "" }: Props) {
  return <pre className={`ascii-monster ${className}`}>{art[variant]}</pre>;
}
