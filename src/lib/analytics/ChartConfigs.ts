import { ChartConfiguration } from 'chart.js';

export const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  success: '#22c55e',
  muted: '#6b7280'
};

export const formatComparisonConfig = (data: any[]): ChartConfiguration => ({
  type: 'bar',
  data: {
    labels: data.map(d => d.format),
    datasets: [
      {
        label: 'Runs',
        data: data.map(d => d.runs),
        backgroundColor: chartColors.primary,
        yAxisID: 'y'
      },
      {
        label: 'Wickets',
        data: data.map(d => d.wickets),
        backgroundColor: chartColors.secondary,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Performance by Format'
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Runs'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Wickets'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }
});

export const careerProgressionConfig = (data: any[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Runs per Year',
        data: data.map(d => d.runs),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + '20',
        tension: 0.1
      },
      {
        label: 'Wickets per Year',
        data: data.map(d => d.wickets),
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.secondary + '20',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Career Progression Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Runs'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Wickets'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }
});

export const dismissalTypesConfig = (data: any): ChartConfiguration => ({
  type: 'pie',
  data: {
    labels: Object.keys(data).map(key => 
      key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    ),
    datasets: [{
      data: Object.values(data),
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.accent,
        chartColors.danger,
        chartColors.warning,
        chartColors.info,
        chartColors.success
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Dismissal Types Distribution'
      },
      legend: {
        position: 'right'
      }
    }
  }
});

export const strikeRateVsAverageConfig = (data: any[]): ChartConfiguration => ({
  type: 'scatter',
  data: {
    datasets: [{
      label: 'Performance by Format',
      data: data.map(d => ({
        x: d.average,
        y: d.strikeRate,
        format: d.format
      })),
      backgroundColor: data.map((_, index) => 
        Object.values(chartColors)[index % Object.values(chartColors).length]
      )
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Strike Rate vs Average'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.raw.format}: Avg ${context.parsed.x}, SR ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Batting Average'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Strike Rate'
        }
      }
    }
  }
});

export const wagonWheelConfig = (data: any[]): ChartConfiguration => ({
  type: 'polarArea',
  data: {
    labels: data.map(d => d.region.replace(/_/g, ' ').toUpperCase()),
    datasets: [{
      data: data.map(d => d.runs),
      backgroundColor: data.map((_, index) => 
        Object.values(chartColors)[index % Object.values(chartColors).length] + '80'
      ),
      borderColor: data.map((_, index) => 
        Object.values(chartColors)[index % Object.values(chartColors).length]
      ),
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Wagon Wheel - Runs by Region'
      },
      legend: {
        position: 'right'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Runs'
        }
      }
    }
  }
});

export const bowlingPhaseConfig = (data: any): ChartConfiguration => ({
  type: 'radar',
  data: {
    labels: ['Economy Rate', 'Wickets', 'Dot Ball %', 'Strike Rate'],
    datasets: [
      {
        label: 'Powerplay',
        data: [
          data.powerplay?.economy || 0,
          data.powerplay?.wickets || 0,
          data.powerplay?.dotBallPercentage || 0,
          data.powerplay?.strikeRate || 0
        ],
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + '20'
      },
      {
        label: 'Middle Overs',
        data: [
          data.middleOvers?.economy || 0,
          data.middleOvers?.wickets || 0,
          data.middleOvers?.dotBallPercentage || 0,
          data.middleOvers?.strikeRate || 0
        ],
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.secondary + '20'
      },
      {
        label: 'Death Overs',
        data: [
          data.deathOvers?.economy || 0,
          data.deathOvers?.wickets || 0,
          data.deathOvers?.dotBallPercentage || 0,
          data.deathOvers?.strikeRate || 0
        ],
        borderColor: chartColors.accent,
        backgroundColor: chartColors.accent + '20'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Bowling Performance by Phase'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  }
});

export const homeAwayComparisonConfig = (homeData: any, awayData: any): ChartConfiguration => ({
  type: 'bar',
  data: {
    labels: ['Matches', 'Runs', 'Average', 'Strike Rate', '100s', '50s'],
    datasets: [
      {
        label: 'Home',
        data: [
          homeData.matches,
          homeData.runs,
          homeData.average,
          homeData.strikeRate,
          homeData.hundreds,
          homeData.fifties
        ],
        backgroundColor: chartColors.primary
      },
      {
        label: 'Away',
        data: [
          awayData.matches,
          awayData.runs,
          awayData.average,
          awayData.strikeRate,
          awayData.hundreds,
          awayData.fifties
        ],
        backgroundColor: chartColors.secondary
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Home vs Away Performance'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});