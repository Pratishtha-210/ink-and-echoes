import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Award, Calendar, BookOpen, Star } from 'lucide-react';
import profileImg from '../assets/profile.jpg';

const About = () => {
  const milestones = [
    {
      year: "2018",
      title: "First Scratches of Ink",
      description: "Began journaling as a therapeutic escape. Discovered the raw translation of emotion to paper.",
      icon: Feather
    },
    {
      year: "2020",
      title: "The Dark Academia Shift",
      description: "Immersed in classical poetry, philosophy, and romantic realism. Transitioned from thoughts to structured poems.",
      icon: BookOpen
    },
    {
      year: "2023",
      title: "Published: Whispering Woods",
      description: "Three nature-centric pieces were selected for publication in an indie literary anthology.",
      icon: Award
    },
    {
      year: "2026",
      title: "Built Ink & Echoes Sanctuary",
      description: "Established a private digital sanctuary to house public archives and host password-protected encrypted entries.",
      icon: Star
    }
  ];

  return (
    <div className="space-y-20 py-10 max-w-5xl mx-auto">
      {/* Intro Bio Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Left Card: Stylized Monochrome Profile mockup */}
        <div className="md:col-span-5">
          <div className="relative group rounded-3xl overflow-hidden border border-luxury-gold/20 shadow-gold-glow max-w-sm mx-auto">
            {/* Dark monochrome filter to represent the figma design layout */}
            <div className="aspect-[4/5] bg-neutral-900 flex flex-col justify-end p-8 relative">
              {/* Profile Image with luxury filters */}
              <img 
                src={profileImg} 
                alt="Pratishtha Sharma" 
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700 pointer-events-none" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10"></div>
              {/* Golden line element */}
              <div className="absolute top-6 left-6 w-12 h-[1px] bg-luxury-gold z-20"></div>
              <div className="absolute top-6 left-6 w-[1px] h-12 bg-luxury-gold z-20"></div>

              <div className="z-20 space-y-2">
                <h3 className="font-serif text-2xl font-bold tracking-wide">Pratishtha Sharma</h3>
                <p className="text-luxury-gold text-xs uppercase tracking-widest font-medium">Poet & Art Director</p>
                <div className="pt-4 border-t border-luxury-border/60">
                  <p className="text-luxury-muted text-xs italic font-serif leading-relaxed">
                    "I write because the world is too loud, and paper is the only thing that knows how to listen in silence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info: Writer card details */}
        <div className="md:col-span-7 space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold">The Storyteller</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Behind the Whispers</h2>
          <p className="text-luxury-muted leading-relaxed font-light text-sm md:text-base">
            I am a writer, poet, and creative curator who views the digital space as a museum of internal echoes. Inspired by dark academia, classical literature, and modern minimalism, my work explores the dualities of life—love and heartbreak, connection and solitude, the scars we carry and the art we craft.
          </p>
          <p className="text-luxury-muted leading-relaxed font-light text-sm md:text-base">
            This space serves as a public repository for my poetry and long-form essays, as well as a strictly private locked vault where I document my daily reflections. Thank you for stepping into my world of paper and shadows.
          </p>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-luxury-border/40 text-center">
            <div>
              <div className="font-serif text-2xl font-semibold text-luxury-gold">50+</div>
              <div className="text-luxury-muted text-xs uppercase tracking-widest mt-1">Poems Written</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-luxury-gold">12+</div>
              <div className="text-luxury-muted text-xs uppercase tracking-widest mt-1">Essays Published</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-luxury-gold">8+ Years</div>
              <div className="text-luxury-muted text-xs uppercase tracking-widest mt-1">Reflecting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold">The Journey</h2>
          <p className="text-luxury-muted text-sm mt-1">Milestones, growth, and chapters along the timeline.</p>
        </div>

        <div className="relative border-l border-luxury-border/60 ml-4 md:ml-1/2 md:translate-x-[-1px] space-y-12 max-w-3xl mx-auto py-6">
          {milestones.map((item, idx) => {
            const Icon = item.icon;
            const isLeft = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative pl-8 md:pl-0"
              >
                {/* Timeline center bullet */}
                <div className="absolute left-[-9px] md:left-1/2 md:translate-x-[-50%] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-luxury-gold z-10 flex items-center justify-center shadow-gold-glow">
                  <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-ping"></div>
                </div>

                {/* Timeline content box */}
                <div className={`md:w-[45%] ${isLeft ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'} bg-luxury-card p-6 rounded-2xl border border-luxury-border hover:border-luxury-gold/30 shadow-gold-glow transition-all duration-300`}>
                  <div className={`flex items-center gap-3 mb-2 justify-start ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                    <Calendar size={14} className="text-luxury-gold" />
                    <span className="font-serif text-luxury-gold font-bold tracking-wider">{item.year}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-luxury-muted text-xs font-light leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default About;
