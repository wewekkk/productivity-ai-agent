type Props = { variant?: "boss" | "small" | "warning" | "hurt"; className?: string };

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
  hurt: `      .--.  .--.
     :   \\__/   :
      \\  > <   /
       \\  T   /
        \\ -- /
       /|    |\\`,
};

function dedentAscii(value: string) {
  const lines = value.replace(/^\n|\n$/g, "").split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  const indent = Math.min(...nonEmpty.map((line) => line.match(/^ */)?.[0].length ?? 0));
  return lines.map((line) => line.slice(indent)).join("\n");
}

export function AsciiMonster({ variant = "boss", className = "" }: Props) {
  return <pre className={`ascii-monster ${className}`}>{dedentAscii(art[variant])}</pre>;
}
