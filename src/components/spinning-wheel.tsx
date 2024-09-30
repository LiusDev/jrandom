'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'

export function SpinningWheelComponent() {
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState('')
  const [result, setResult] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wheelAngleRef = useRef(0)

  useEffect(() => {
    drawWheel()
  }, [options])

  const addOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (newOption.trim() !== '') {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const drawWheel = (rotationAngle = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    if (options.length === 0) {
      ctx.font = '20px Arial'
      ctx.fillStyle = '#888'
      ctx.textAlign = 'center'
      ctx.fillText('Add options to create a wheel', centerX, centerY)
      return
    }

    const sliceAngle = (2 * Math.PI) / options.length

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationAngle)
    ctx.translate(-centerX, -centerY)

    options.forEach((option, index) => {
      const startAngle = index * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = `hsl(${(index * 360) / options.length}, 70%, 70%)`
      ctx.fill()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#000'
      ctx.font = '14px Arial'
      ctx.fillText(option, radius - 10, 5)
      ctx.restore()
    })

    ctx.restore()

    // Draw an arrow
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(radius + 20, -10)
    ctx.lineTo(radius + 20, 10)
    ctx.closePath()
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.restore()
  }

  const spinWheel = () => {
    if (options.length === 0 || isSpinning) return

    setIsSpinning(true)
    setResult('')

    const canvas = canvasRef.current
    if (!canvas) return

    const totalDuration = 5000 // Total spin duration in milliseconds
    const minSpins = 5 // Minimum number of full rotations
    const startTime = Date.now()
    const startAngle = wheelAngleRef.current
    const spinAngle = Math.random() * Math.PI * 2 + Math.PI * 10 // Random angle between 10π and 12π (5-6 full rotations)

    const animate = () => {
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(elapsedTime / totalDuration, 1)
      
      // Easing function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
      
      const currentAngle = startAngle + spinAngle * easeOut(progress)
      wheelAngleRef.current = currentAngle % (Math.PI * 2)
      
      drawWheel(wheelAngleRef.current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        const selectedIndex = Math.floor(((Math.PI * 2 - (wheelAngleRef.current % (Math.PI * 2))) / (Math.PI * 2)) * options.length)
        setResult(options[selectedIndex])
      }
    }

    animate()
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Spinning Wheel of Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={addOption} className="mb-4">
            <Label htmlFor="newOption">Add Option</Label>
            <div className="flex mt-1.5">
              <Input
                type="text"
                id="newOption"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Enter an option"
                className="flex-grow"
              />
              <Button type="submit" className="ml-2">Add</Button>
            </div>
          </form>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Options:</h2>
            {options.length === 0 ? (
              <p className="text-gray-500">No options added yet.</p>
            ) : (
              <ul className="space-y-2">
                {options.map((option, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-2 rounded">
                    <span>{option}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      aria-label={`Remove ${option}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full max-w-[300px] mx-auto mb-4 border rounded"
          />
          <div className="text-center">
            <Button onClick={spinWheel} disabled={isSpinning || options.length === 0} className="mb-4">
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </Button>
            {result && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Result:</h2>
                <p className="text-2xl font-bold">{result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}