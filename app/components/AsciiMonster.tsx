type MonsterState = "normal" | "hurt" | "defeated";
type Props = { state?: MonsterState; className?: string };

const art = {
  normal: `      .--.  .--.
     :   \\__/   :
      \\  6  6  /
       \\   '  /
        \\ -- /
       /|    |\\`,
  hurt: `      .--.  .--.
     :   \\__/   :
      \\  > <   /
       \\  T   /
        \\ -- /
       /|    |\\`,
  defeated: `      .--.  .--.
     :   x__x   :
      \\        /
       '------'`,
};

function dedentAscii(value: string) {
  const lines = value.replace(/^\n|\n$/g, "").split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  const indent = Math.min(...nonEmpty.map((line) => line.match(/^ */)?.[0].length ?? 0));
  return lines.map((line) => line.slice(indent)).join("\n");
}

export function AsciiMonster({ state = "normal", className = "" }: Props) {
  return <pre className={`ascii-monster ${className}`}>{dedentAscii(art[state])}</pre>;
}
