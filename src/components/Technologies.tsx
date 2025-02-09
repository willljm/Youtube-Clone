import React from 'react';

interface TechnologyCardProps {
  name: string;
  icon: string;
}

const TechnologyCard: React.FC<TechnologyCardProps> = ({ name, icon }) => (
  <div className="bg-zinc-900 p-4 rounded-lg flex flex-col items-center justify-center gap-2">
    <img src={icon} alt={name} className="w-12 h-12" />
    <span className="text-white text-sm">{name}</span>
  </div>
);

interface TechnologySectionProps {
  title: string;
  technologies: Array<{ name: string; icon: string }>;
}

const TechnologySection: React.FC<TechnologySectionProps> = ({ title, technologies }) => (
  <div className="bg-zinc-950 p-6 rounded-xl">
    <h3 className="text-purple-500 font-semibold mb-4 text-xl">{title}</h3>
    <div className="grid grid-cols-3 gap-4">
      {technologies.map((tech) => (
        <TechnologyCard key={tech.name} {...tech} />
      ))}
    </div>
  </div>
);

const Technologies = () => {
  const frontendTech = [
    { name: 'HTML', icon: '/tech/html.svg' },
    { name: 'CSS', icon: '/tech/css.svg' },
    { name: 'JavaScript', icon: '/tech/javascript.svg' },
    { name: 'React', icon: '/tech/react.svg' },
    { name: 'Next.js', icon: '/tech/nextjs.svg' },
    { name: 'Astro', icon: '/tech/astro.svg' },
  ];

  const toolsAndUI = [
    { name: 'Tailwind', icon: '/tech/tailwind.svg' },
    { name: 'Bootstrap', icon: '/tech/bootstrap.svg' },
    { name: 'Vite', icon: '/tech/vite.svg' },
    { name: 'TypeScript', icon: '/tech/typescript.svg' },
    { name: 'jQuery', icon: '/tech/jquery.svg' },
    { name: 'ReactRouter', icon: '/tech/reactrouter.svg' },
  ];

  const backendAndMore = [
    { name: 'MySQL', icon: '/tech/mysql.svg' },
    { name: 'PHP', icon: '/tech/php.svg' },
    { name: 'Firebase', icon: '/tech/firebase.svg' },
    { name: 'Neon', icon: '/tech/neon.svg' },
    { name: 'Supabase', icon: '/tech/supabase.svg' },
    { name: 'Prisma', icon: '/tech/prisma.svg' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TechnologySection title="Desarrollo Frontend" technologies={frontendTech} />
        <TechnologySection title="Herramientas & UI" technologies={toolsAndUI} />
        <TechnologySection title="Backend & Más" technologies={backendAndMore} />
      </div>
    </div>
  );
};

export default Technologies;
