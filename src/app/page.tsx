import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LightweightCTA from '@/components/LightweightCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Marketing sections */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose Public Trending?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights into what&apos;s trending across the web with our privacy-first approach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Understand not just what&apos;s trending, but why it&apos;s trending with our advanced AI analysis.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-muted-foreground">
                No tracking, no data collection. Your browsing habits stay private while you stay informed.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
              <p className="text-muted-foreground">
                Track trends from multiple sources worldwide to get the complete picture of what&apos;s happening.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Discover What&apos;s Trending?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who stay ahead of the curve with our trending insights platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LightweightCTA 
              href="/dashboard/trending" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
            >
              Start Exploring →
            </LightweightCTA>
          </div>
        </div>
      </section>
    </div>
  );
}
