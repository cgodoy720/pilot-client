import { ExternalLink, BookOpen, Headphones, Newspaper, Brain } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function EngageTechNews({ task, onComplete }) {
  const resources = [
    {
      name: 'Y Combinator Newsletter',
      url: 'https://www.ycombinator.com/newsletters',
      description: 'YC is the most well-known startup accelerator. Their newsletter shares insights, success stories, and tech trends.',
      icon: <Newspaper className="h-5 w-5" />
    },
    {
      name: 'a16z Newsletter',
      url: 'https://a16z.com/newsletters/',
      description: 'Andreessen Horowitz (a16z) is one of the most influential venture capital firms in tech. Their content provides deep analysis on industry trends and emerging technologies.',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: 'All-In Podcast',
      url: 'https://www.allinpodcast.co/',
      description: 'A candid, unfiltered discussion by prominent tech investors and operators about business, tech, and global issues.',
      icon: <Headphones className="h-5 w-5" />
    },
    {
      name: 'Paul Graham\'s Essays',
      url: 'http://www.paulgraham.com/articles.html',
      description: 'Paul Graham is a co-founder of Y Combinator and one of the most influential thinkers in startups. His essays provide deep insights into entrepreneurship, innovation, and work.',
      icon: <Brain className="h-5 w-5" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-800">
                In this program, you're not only learning how to build with AI—you're learning how to be and thrive in tech. If tech and business are a culture, you have to learn the language, know the customs, and understand the underlying dynamics. Our goal is to make you tech and business fluent.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Why This Matters</h2>
        
        <p className="text-[#666] mb-6">
          To achieve this, you'll be actively engaging with industry-leading blogs, newsletters, and podcasts. This will help you:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Learning Benefits</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Develop a habit of continuous learning</li>
              <li>• Stay informed about trends and insights</li>
              <li>• Understand key players in tech and business</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 mb-3">Professional Growth</h3>
            <ul className="space-y-2 text-green-800">
              <li>• Cultivate critical thinking skills</li>
              <li>• Learn to analyze industry ideas</li>
              <li>• Think like a tech professional</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Recommended Resources</h2>
        <p className="text-[#666] mb-6">To get started, we suggest subscribing to the following:</p>
        
        <div className="space-y-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#4242EA] rounded-lg flex items-center justify-center text-white">
                  {resource.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2">{resource.name}</h3>
                  <p className="text-[#666] mb-4">{resource.description}</p>
                  <Button 
                    onClick={() => window.open(resource.url, '_blank')}
                    variant="outline"
                    className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Subscribe/Visit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Expectations for Engagement</h2>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p className="text-amber-800 mb-4">
            Throughout the program, we'll actively discuss these articles, podcasts, and readings. Your participation will help you develop the habit of keeping up to date and continuously expanding your knowledge base.
          </p>
        </div>

        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">How to Engage:</h3>
          <ul className="space-y-3 text-[#666]">
            <li><strong>Read & Listen Regularly:</strong> Set aside time each week to engage with the recommended content.</li>
            <li><strong>Take Notes:</strong> Jot down key insights, questions, or ideas that stand out to you.</li>
            <li><strong>Discuss in Sessions:</strong> Be ready to share your thoughts, critique ideas, and ask questions during our discussions.</li>
            <li><strong>Apply What You Learn:</strong> Think about how the concepts relate to AI, startups, and your personal career goals.</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">Remember</h2>
          <p className="text-green-800 mb-4">
            Becoming fluent in tech and business isn't about memorizing facts—it's about immersing yourself in the conversations, ideas, and debates shaping the industry. Approach this with curiosity, and over time, you'll develop a strong understanding of how the industry operates.
          </p>
          <p className="text-green-800 font-semibold text-lg">
            Let's get started! 🚀
          </p>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've subscribed to the recommended newsletters and podcasts, and feel ready to engage with tech news regularly, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default EngageTechNews;
