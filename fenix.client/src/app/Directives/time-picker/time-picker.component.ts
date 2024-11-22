import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [MatOptionModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, CommonModule,DatePipe ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnInit  {
  @Input() label!: string;
  @Input() name!: string;
  @Input() startHour!: number; // Start time
  @Output() startHourChange = new EventEmitter<number>();
  @Input() endHour!: number; // End time
  @Input() interval!: number; // Interval in minutes
  @Input() selectedTime!: Date; // Initially selected time
  @Output() selectedTimeChange = new EventEmitter<Date>();
  constructor() {
    if(!this.startHour) {
      this.startHour = 0;
    }
  }
  ngOnInit() {
    this.setTimes();
    this.initializeSelectedTime();
  }
  initializeSelectedTime() {
    if (!this.selectedTime) {
      this.selectedTime = this.times.length > 0 ? this.times[0] : new Date();
      this.selectedTimeChange.emit(this.selectedTime);
    } else {
      // Ensure the selectedTime matches a time in the times array
      const matchingTime = this.times.find(time => time.getTime() === this.selectedTime.getTime());
      if (matchingTime) {
        this.selectedTime = matchingTime;
      } else {
        this.selectedTime = this.times.length > 0 ? this.times[0] : new Date();
      }
      this.selectedTimeChange.emit(this.selectedTime);
    }
  }


  times: Date[] = []; // Time array
  setTimes() {
    for (let hour = this.startHour; hour <= this.endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += this.interval) {
        const time = new Date();
        time.setHours(hour,minutes, 0, 0);
        this.times.push(time);
      }
    }
  }
  
  onSelection($event: MatSelectChange) {
    this.selectedTime = $event.value;
    this.selectedTimeChange.emit(this.selectedTime);
  }

  formatTime(hour: number, minutes: number): string {
    const h = hour < 10 ? '0' + hour : hour.toString();
    const m = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${h}:${m}`;
  }
  DateToTime(time: Date): number {
    return time.getHours() + time.getMinutes() / 60;
  }
}
