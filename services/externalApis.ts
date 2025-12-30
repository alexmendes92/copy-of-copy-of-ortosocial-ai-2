
// --- API 1: OPEN-METEO (Weather & Health) ---
// Free, no key required. Used to predict joint pain risk based on weather conditions.

export interface WeatherHealthData {
    temperature: number;
    humidity: number;
    pressure: number;
    painRisk: 'Baixo' | 'Moderado' | 'Alto';
    message: string;
    icon: 'sun' | 'cloud-rain' | 'snowflake' | 'cloud';
}

export const getJointPainForecast = async (): Promise<WeatherHealthData> => {
    // Default: Sao Paulo coordinates (in a real app, use navigator.geolocation)
    const lat = -23.5505;
    const lon = -46.6333;
    
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code&timezone=auto`);
        
        if (!response.ok) throw new Error('Weather API failed');
        
        const data = await response.json();
        const current = data.current;
        
        const temp = current.temperature_2m;
        const hum = current.relative_humidity_2m;
        const press = current.surface_pressure;
        const code = current.weather_code;

        // --- Orthopedic Pain Heuristic ---
        // Studies suggest: Low Temp + High Humidity + Low Pressure = Higher Pain
        let riskScore = 0;
        
        if (temp < 18) riskScore += 2;
        else if (temp < 22) riskScore += 1;
        
        if (hum > 70) riskScore += 2;
        else if (hum > 50) riskScore += 1;
        
        if (press < 1010) riskScore += 2;

        let risk: 'Baixo' | 'Moderado' | 'Alto' = 'Baixo';
        let message = "Clima favorável para as articulações.";

        if (riskScore >= 5) {
            risk = 'Alto';
            message = "Alerta de dor: Frio e umidade podem agravar sintomas de artrose.";
        } else if (riskScore >= 3) {
            risk = 'Moderado';
            message = "Pacientes sensíveis podem sentir desconforto hoje.";
        }

        // Icon mapping
        let icon: any = 'sun';
        if (code >= 51 && code <= 67) icon = 'cloud-rain'; // Rain
        else if (code >= 71) icon = 'snowflake'; // Snow
        else if (code > 3) icon = 'cloud'; // Cloudy

        return { 
            temperature: temp, 
            humidity: hum, 
            pressure: press, 
            painRisk: risk, 
            message,
            icon 
        };

    } catch (e) {
        console.error("Weather API Error", e);
        // Fallback data
        return { 
            temperature: 24, 
            humidity: 60, 
            pressure: 1015, 
            painRisk: 'Baixo', 
            message: 'Dados meteorológicos indisponíveis momentaneamente.',
            icon: 'sun'
        };
    }
};

// --- API 2: NAGER.DATE (Public Holidays) ---
// Free, no key required. Used to suggest content based on dates.

export interface Holiday {
    date: string;
    localName: string;
    name: string;
    daysUntil: number;
}

export const getUpcomingHolidays = async (): Promise<Holiday[]> => {
    const year = new Date().getFullYear();
    const countryCode = 'BR'; // Brazil

    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        
        if (!response.ok) throw new Error('Holiday API failed');

        const data = await response.json();
        const today = new Date();
        today.setHours(0,0,0,0);

        // Filter and process
        const upcoming = data
            .filter((h: any) => new Date(h.date + 'T00:00:00') >= today)
            .map((h: any) => {
                const hDate = new Date(h.date + 'T00:00:00');
                const diffTime = Math.abs(hDate.getTime() - today.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                return {
                    date: h.date,
                    localName: h.localName,
                    name: h.name,
                    daysUntil: diffDays
                };
            })
            .sort((a: Holiday, b: Holiday) => a.daysUntil - b.daysUntil)
            .slice(0, 3); // Get next 3

        return upcoming;

    } catch (e) {
        console.error("Holiday API Error", e);
        return [];
    }
};
