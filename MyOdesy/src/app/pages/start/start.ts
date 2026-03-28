import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './start.html',
  styleUrl: './start.scss'
})
export class Start {}